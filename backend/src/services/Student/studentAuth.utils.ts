import { StudentAuthError } from "./studentAuth.errors";

const STUDENT_CODE_REGEX = /^[A-Za-z0-9_-]{3,30}$/;
const LOCAL_EMAIL_PART_REGEX = /^[a-z0-9._%+-]+$/;

function ensureString(value: unknown, fieldName: string): string {
    if (typeof value !== "string") {
        throw new StudentAuthError(`Campo '${fieldName}' inválido`, 400, "INVALID_PAYLOAD");
    }

    const normalized = value.trim();
    if (!normalized) {
        throw new StudentAuthError(`Campo '${fieldName}' es obligatorio`, 400, "INVALID_PAYLOAD");
    }

    return normalized;
}

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeInstitutionalEmail(value: unknown, allowedDomain: string): string {
    const raw = ensureString(value, "email").toLowerCase();
    const [localPart, domain, ...rest] = raw.split("@");

    if (rest.length > 0 || !localPart || !domain) {
        throw new StudentAuthError("Correo electrónico inválido", 400, "INVALID_EMAIL");
    }

    const domainRegex = new RegExp(`^${escapeRegex(allowedDomain.toLowerCase())}$`);
    if (!domainRegex.test(domain)) {
        throw new StudentAuthError(`Solo se permiten correos @${allowedDomain}`, 400, "INVALID_EMAIL_DOMAIN");
    }

    if (!LOCAL_EMAIL_PART_REGEX.test(localPart)) {
        throw new StudentAuthError("Correo electrónico inválido", 400, "INVALID_EMAIL");
    }

    return raw;
}

export function normalizeStudentCode(value: unknown): string {
    const studentCode = ensureString(value, "studentCode");
    if (!STUDENT_CODE_REGEX.test(studentCode)) {
        throw new StudentAuthError(
            "studentCode inválido. Usa 3-30 caracteres: letras, números, '_' o '-'",
            400,
            "INVALID_STUDENT_CODE",
        );
    }

    return studentCode;
}

export function ensureStrongPassword(value: unknown): string {
    const password = ensureString(value, "password");
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (password.length < 10 || !hasUpper || !hasLower || !hasNumber) {
        throw new StudentAuthError(
            "La contraseña debe tener al menos 10 caracteres, mayúscula, minúscula y número",
            400,
            "WEAK_PASSWORD",
        );
    }
    return password;
}

export function ensureName(value: unknown, fieldName: "firstName" | "lastName"): string {
    const normalized = ensureString(value, fieldName);
    if (normalized.length > 80) {
        throw new StudentAuthError(`Campo '${fieldName}' demasiado largo`, 400, "INVALID_PAYLOAD");
    }
    return normalized;
}

export function ensureSectionId(value: unknown): string {
    const sectionId = ensureString(value, "sectionId");
    if (sectionId.length > 50) {
        throw new StudentAuthError("sectionId inválido", 400, "INVALID_PAYLOAD");
    }
    return sectionId;
}

function extractSupabaseMessage(payload: unknown): string | undefined {
    if (!payload || typeof payload !== "object") return undefined;

    const record = payload as Record<string, unknown>;
    const candidates = [record.msg, record.message, record.error_description, record.error];
    for (const candidate of candidates) {
        if (typeof candidate === "string" && candidate.trim()) {
            return candidate.trim();
        }
    }
    return undefined;
}

type SupabaseAction = "request-code" | "verify-code" | "update-password" | "login";

export function mapSupabaseError(action: SupabaseAction, status: number, payload: unknown): StudentAuthError {
    const upstreamMessage = extractSupabaseMessage(payload);

    if (status === 429) {
        return new StudentAuthError("Demasiados intentos. Inténtalo más tarde.", 429, "RATE_LIMITED");
    }

    if (status >= 500) {
        return new StudentAuthError("Proveedor de autenticación no disponible", 503, "AUTH_PROVIDER_UNAVAILABLE");
    }

    if (action === "verify-code") {
        return new StudentAuthError("Código inválido o expirado", 401, "INVALID_OTP");
    }

    if (action === "login") {
        return new StudentAuthError("Credenciales inválidas", 401, "INVALID_CREDENTIALS");
    }

    if (action === "update-password") {
        return new StudentAuthError(
            upstreamMessage ?? "No se pudo configurar la contraseña",
            503,
            "PASSWORD_SETUP_FAILED",
        );
    }

    return new StudentAuthError(upstreamMessage ?? "No se pudo enviar el código al correo", 503, "OTP_SEND_FAILED");
}

export function normalizeIp(ip: string | undefined): string {
    if (!ip) return "unknown";
    return ip.trim().toLowerCase() || "unknown";
}
