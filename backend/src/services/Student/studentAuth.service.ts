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
    studentCode: unknown;
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
        const studentCode = normalizeStudentCode(input.studentCode);
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

                if (existingActive && existingActive.registrationStatus === "ACTIVE" && existingActive.studentCode === studentCode) {
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
                const existingByEmail = await tx.student.findUnique({
                    where: { institutionalEmail: email },
                });

                const existingByCode = await tx.student.findUnique({
                    where: { studentCode },
                });

                if (existingByCode && existingByCode.institutionalEmail && existingByCode.institutionalEmail !== email) {
                    throw new StudentAuthError("studentCode ya está vinculado a otro correo", 409, "STUDENT_CODE_CONFLICT");
                }

                if (existingByEmail) {
                    if (existingByEmail.registrationStatus === "SUSPENDED") {
                        throw new StudentAuthError("La cuenta está suspendida", 401, "ACCOUNT_SUSPENDED");
                    }

                    if (existingByCode && existingByCode.id !== existingByEmail.id) {
                        throw new StudentAuthError("studentCode ya está en uso", 409, "STUDENT_CODE_CONFLICT");
                    }

                    const updated = await tx.student.update({
                        where: { id: existingByEmail.id },
                        data: {
                            firstName,
                            lastName,
                            sectionId,
                            studentCode,
                            supabaseUserId: verifyResult.user.id,
                            registrationStatus: "ACTIVE",
                            registeredAt: existingByEmail.registeredAt ?? now,
                        },
                    });

                    return {
                        created: false,
                        student: updated,
                    };
                }

                if (existingByCode) {
                    if (existingByCode.registrationStatus === "SUSPENDED") {
                        throw new StudentAuthError("La cuenta está suspendida", 401, "ACCOUNT_SUSPENDED");
                    }

                    const claimed = await tx.student.update({
                        where: { id: existingByCode.id },
                        data: {
                            firstName,
                            lastName,
                            sectionId,
                            institutionalEmail: email,
                            supabaseUserId: verifyResult.user.id,
                            registrationStatus: "ACTIVE",
                            registeredAt: now,
                        },
                    });

                    return {
                        created: true,
                        student: claimed,
                    };
                }

                const created = await tx.student.create({
                    data: {
                        firstName,
                        lastName,
                        studentCode,
                        sectionId,
                        institutionalEmail: email,
                        supabaseUserId: verifyResult.user.id,
                        registrationStatus: "ACTIVE",
                        registeredAt: now,
                    },
                });

                return {
                    created: true,
                    student: created,
                };
            });
        } catch (error) {
            if (error instanceof StudentAuthError) {
                throw error;
            }

            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new StudentAuthError("Conflicto de datos durante el registro", 409, "STUDENT_CONFLICT");
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
