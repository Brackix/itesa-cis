import prisma from "../../../prisma/prisma.instance";
import { Prisma, RegistrationStatus, Student } from "@prisma/client";
import { getSupabaseConfig } from "../../config/supabase.config";
import { StudentAuthError } from "./studentAuth.errors";
import {
    ensureName,
    ensureSectionId,
    ensureStrongPassword,
    mapSupabaseError,
    normalizeInstitutionalEmail,
    normalizeIp,
    normalizeStudentCode,
} from "./studentAuth.utils";

type SupabaseSession = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
    token_type: string;
    user: {
        id: string;
        email: string;
    };
};

type VerifySignupInput = {
    email: unknown;
    code: unknown;
    password: unknown;
    firstName: unknown;
    lastName: unknown;
    sectionId: unknown;
};

type StudentSummary = {
    id: string;
    studentCode: string;
    firstName: string;
    lastName: string;
    institutionalEmail: string | null;
    sectionId: string;
    registrationStatus: RegistrationStatus;
    firstLoginAt: Date | null;
    registeredAt: Date | null;
};

type RateLimitRule = {
    limit: number;
    windowMs: number;
};

type RateBucket = {
    count: number;
    windowEnd: number;
};

const rateLimitBuckets = new Map<string, RateBucket>();
const REQUEST_CODE_RATE_LIMIT: RateLimitRule = { limit: 5, windowMs: 10 * 60 * 1000 };
const VERIFY_RATE_LIMIT: RateLimitRule = { limit: 8, windowMs: 10 * 60 * 1000 };
const LOGIN_RATE_LIMIT: RateLimitRule = { limit: 10, windowMs: 15 * 60 * 1000 };

const OTP_REGEX = /^[A-Za-z0-9]{4,12}$/;

function ensureOtpCode(value: unknown): string {
    if (typeof value !== "string") {
        throw new StudentAuthError("Código OTP inválido", 400, "INVALID_OTP_FORMAT");
    }
    const code = value.trim();
    if (!OTP_REGEX.test(code)) {
        throw new StudentAuthError("Código OTP inválido", 400, "INVALID_OTP_FORMAT");
    }
    return code;
}

function ensureLoginPassword(value: unknown): string {
    if (typeof value !== "string" || !value.trim()) {
        throw new StudentAuthError("password es obligatorio", 400, "INVALID_PAYLOAD");
    }
    return value;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export class StudentAuthService {
    private readonly config = getSupabaseConfig();

    async getAvailableSections() {
        const activeFair = await prisma.fair.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: "desc" },
            select: { id: true },
        });

        if (!activeFair) {
            return { sections: [] as Array<{ id: string; name: string }> };
        }

        const sections = await prisma.section.findMany({
            where: { fairId: activeFair.id },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });

        return { sections };
    }

    async requestSignupCode(emailRaw: unknown, ip: string | undefined) {
        const email = normalizeInstitutionalEmail(emailRaw, this.config.allowedEmailDomain);
        const safeIp = normalizeIp(ip);
        this.checkRateLimit("request-code", `${safeIp}:${email}`, REQUEST_CODE_RATE_LIMIT);

        await this.withRetry(async () => {
            await this.supabaseRequest("request-code", "/auth/v1/otp", {
                method: "POST",
                body: {
                    email,
                    create_user: true,
                },
            });
        });

        return {
            message: "Si el correo institucional es válido, recibirás un código en breve.",
            cooldownSeconds: Math.floor(REQUEST_CODE_RATE_LIMIT.windowMs / 1000),
        };
    }

    async verifySignup(input: VerifySignupInput, ip: string | undefined) {
        const email = normalizeInstitutionalEmail(input.email, this.config.allowedEmailDomain);
        const code = ensureOtpCode(input.code);
        const password = ensureStrongPassword(input.password);
        const firstName = ensureName(input.firstName, "firstName");
        const lastName = ensureName(input.lastName, "lastName");
        const sectionId = ensureSectionId(input.sectionId);

        // Extract studentCode from joined email format (e.g. yirbermanon0110@itesa.edu.do -> 2023-0110)
        const localPart = email.split('@')[0];

        // Grab the last 4 characters from the local part
        const extractedDigits = localPart.slice(-4);
        if (!/^\d{4}$/.test(extractedDigits)) {
            throw new StudentAuthError("Formato de correo inválido. Se esperaban 4 dígitos al final del usuario (ej. nombre0110@dominio).", 400, "INVALID_EMAIL_FORMAT");
        }

        // Prefix with the static 2023- enrollment year
        const extractedStudentCode = `2023-${extractedDigits}`;

        const safeIp = normalizeIp(ip);

        this.checkRateLimit("verify-signup", `${safeIp}:${email}`, VERIFY_RATE_LIMIT);

        await this.ensureValidActiveSection(sectionId);

        let verifyResult: SupabaseSession;
        try {
            verifyResult = await this.withRetry(() =>
                this.supabaseRequest<SupabaseSession>("verify-code", "/auth/v1/verify", {
                    method: "POST",
                    body: {
                        email,
                        token: code,
                        type: "email",
                    },
                }),
            );
        } catch (error) {
            const normalizedError = this.normalizeError(error);
            if (normalizedError.code === "INVALID_OTP") {
                const existingActive = await prisma.student.findUnique({
                    where: { institutionalEmail: email },
                });

                if (existingActive && existingActive.registrationStatus === "ACTIVE") {
                    const loginResult = await this.login(email, password, ip);
                    return {
                        created: false,
                        student: loginResult.student,
                        session: loginResult.session,
                    };
                }
            }

            throw normalizedError;
        }

        if (!verifyResult.access_token || !verifyResult.user?.id) {
            throw new StudentAuthError("No se pudo verificar la sesión del estudiante", 503, "INVALID_AUTH_RESPONSE");
        }

        await this.withRetry(() =>
            this.supabaseRequest("update-password", "/auth/v1/user", {
                method: "PUT",
                accessToken: verifyResult.access_token,
                body: { password },
            }),
        );

        const now = new Date();
        let upsertResult: { created: boolean; student: Student };
        try {
            upsertResult = await prisma.$transaction(async (tx) => {
                // Determine if a student already secured this email intentionally
                const existingByEmail = await tx.student.findUnique({
                    where: { institutionalEmail: email },
                });

                if (existingByEmail) {
                    if (existingByEmail.registrationStatus === "SUSPENDED") {
                        throw new StudentAuthError("La cuenta está suspendida", 401, "ACCOUNT_SUSPENDED");
                    }
                    if (existingByEmail.registrationStatus === "ACTIVE") {
                        throw new StudentAuthError("Este estudiante ya ha activado su cuenta.", 409, "ALREADY_ACTIVE");
                    }
                }

                // Identify the true PENDING pre-loaded student using Corroboration inputs
                const pendingStudent = await tx.student.findFirst({
                    where: {
                        firstName: { equals: firstName, mode: "insensitive" },
                        lastName: { equals: lastName, mode: "insensitive" },
                        sectionId: sectionId,
                        registrationStatus: "PENDING"
                    }
                });

                if (!pendingStudent) {
                    throw new StudentAuthError("No se encontró ningún estudiante pendiente de activación con este nombre y sección en la base de datos.", 404, "STUDENT_NOT_FOUND");
                }

                // Safely update the preloaded admin row
                const activatedStudent = await tx.student.update({
                    where: { id: pendingStudent.id },
                    data: {
                        studentCode: extractedStudentCode,
                        institutionalEmail: email,
                        supabaseUserId: verifyResult.user.id,
                        registrationStatus: "ACTIVE",
                        registeredAt: now,
                    },
                });

                return {
                    created: false,
                    student: activatedStudent,
                };
            });
        } catch (error) {
            if (error instanceof StudentAuthError) {
                throw error;
            }

            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new StudentAuthError("Conflicto de unicidad en la base de datos (quizás la matrícula ya estaba en uso).", 409, "STUDENT_CONFLICT");
            }

            throw this.normalizeError(error);
        }

        return {
            created: upsertResult.created,
            student: this.toStudentSummary(upsertResult.student),
            session: verifyResult,
        };
    }

    async login(emailRaw: unknown, passwordRaw: unknown, ip: string | undefined) {
        const email = normalizeInstitutionalEmail(emailRaw, this.config.allowedEmailDomain);
        const password = ensureLoginPassword(passwordRaw);
        const safeIp = normalizeIp(ip);

        this.checkRateLimit("login", `${safeIp}:${email}`, LOGIN_RATE_LIMIT);

        const session = await this.withRetry(() =>
            this.supabaseRequest<SupabaseSession>("login", "/auth/v1/token?grant_type=password", {
                method: "POST",
                body: {
                    email,
                    password,
                },
            }),
        );

        if (!session.user?.id) {
            throw new StudentAuthError("No se pudo validar la sesión del estudiante", 503, "INVALID_AUTH_RESPONSE");
        }

        let student = await prisma.student.findFirst({
            where: {
                OR: [{ supabaseUserId: session.user.id }, { institutionalEmail: email }],
            },
        });

        if (!student) {
            throw new StudentAuthError("Perfil de estudiante no completado", 404, "PROFILE_NOT_FOUND");
        }

        if (student.registrationStatus === "SUSPENDED") {
            throw new StudentAuthError("La cuenta está suspendida", 401, "ACCOUNT_SUSPENDED");
        }

        const shouldUpdateUserId = !student.supabaseUserId;
        const shouldSetFirstLogin = !student.firstLoginAt;
        if (shouldUpdateUserId || shouldSetFirstLogin) {
            student = await prisma.student.update({
                where: { id: student.id },
                data: {
                    supabaseUserId: shouldUpdateUserId ? session.user.id : student.supabaseUserId,
                    firstLoginAt: shouldSetFirstLogin ? new Date() : student.firstLoginAt,
                },
            });
        }

        return {
            student: this.toStudentSummary(student),
            session,
        };
    }

    private async ensureValidActiveSection(sectionId: string): Promise<void> {
        const section = await prisma.section.findUnique({
            where: { id: sectionId },
            select: {
                id: true,
                fair: {
                    select: { isActive: true },
                },
            },
        });

        if (!section || !section.fair.isActive) {
            throw new StudentAuthError(
                "Sección inválida o no asociada a una feria activa",
                422,
                "INVALID_SECTION",
            );
        }
    }

    private checkRateLimit(action: string, key: string, rule: RateLimitRule): void {
        if (!this.config.rateLimitEnabled) {
            return;
        }

        const rateKey = `${action}:${key}`;
        const now = Date.now();
        const bucket = rateLimitBuckets.get(rateKey);

        if (!bucket || now >= bucket.windowEnd) {
            rateLimitBuckets.set(rateKey, { count: 1, windowEnd: now + rule.windowMs });
            return;
        }

        if (bucket.count >= rule.limit) {
            throw new StudentAuthError("Demasiados intentos. Inténtalo más tarde.", 429, "RATE_LIMITED");
        }

        bucket.count += 1;
        rateLimitBuckets.set(rateKey, bucket);
    }

    private async withRetry<T>(executor: () => Promise<T>): Promise<T> {
        const maxAttempts = 3;

        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            try {
                return await executor();
            } catch (error) {
                const normalized = this.normalizeError(error);
                const isRetriable = normalized.statusCode === 429 || normalized.statusCode === 503;
                const hasAttemptsLeft = attempt < maxAttempts;

                if (!isRetriable || !hasAttemptsLeft) {
                    throw normalized;
                }

                const backoffMs = 200 * attempt * attempt;
                await sleep(backoffMs);
            }
        }

        throw new StudentAuthError("Error de autenticación desconocido", 503, "AUTH_PROVIDER_UNAVAILABLE");
    }

    private async supabaseRequest<T = unknown>(
        action: "request-code" | "verify-code" | "update-password" | "login",
        path: string,
        options: {
            method: "POST" | "PUT";
            body: unknown;
            accessToken?: string;
        },
    ): Promise<T> {
        let response: Response;

        try {
            response = await fetch(`${this.config.url}${path}`, {
                method: options.method,
                headers: {
                    apikey: this.config.anonKey,
                    "Content-Type": "application/json",
                    ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
                },
                body: JSON.stringify(options.body),
            });
        } catch (_error) {
            throw new StudentAuthError("Proveedor de autenticación no disponible", 503, "AUTH_PROVIDER_UNAVAILABLE");
        }

        const rawBody = await response.text();
        let payload: unknown = null;
        if (rawBody) {
            try {
                payload = JSON.parse(rawBody);
            } catch (_error) {
                payload = { message: rawBody };
            }
        }

        if (!response.ok) {
            throw mapSupabaseError(action, response.status, payload);
        }

        return payload as T;
    }

    private normalizeError(error: unknown): StudentAuthError {
        if (error instanceof StudentAuthError) {
            return error;
        }

        if (error instanceof Error) {
            return new StudentAuthError(error.message, 503, "AUTH_PROVIDER_UNAVAILABLE");
        }

        return new StudentAuthError("Error inesperado", 503, "AUTH_PROVIDER_UNAVAILABLE");
    }

    private toStudentSummary(student: Student): StudentSummary {
        return {
            id: student.id,
            studentCode: student.studentCode,
            firstName: student.firstName,
            lastName: student.lastName,
            institutionalEmail: student.institutionalEmail,
            sectionId: student.sectionId,
            registrationStatus: student.registrationStatus,
            firstLoginAt: student.firstLoginAt,
            registeredAt: student.registeredAt,
        };
    }
}
