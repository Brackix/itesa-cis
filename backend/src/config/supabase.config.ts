export type SupabaseConfig = {
    url: string;
    anonKey: string;
    allowedEmailDomain: string;
    rateLimitEnabled: boolean;
};

function getRequiredEnv(key: string): string {
    const value = process.env[key]?.trim();
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

export function getSupabaseConfig(): SupabaseConfig {
    const url = getRequiredEnv("SUPABASE_URL").replace(/\/+$/, "");
    const anonKey = getRequiredEnv("SUPABASE_ANON_KEY");
    const allowedEmailDomain = (process.env.STUDENT_ALLOWED_EMAIL_DOMAIN ?? "itesa.edu.do")
        .trim()
        .toLowerCase();
    const rateLimitEnabled = (process.env.AUTH_RATE_LIMIT_ENABLED ?? "true").toLowerCase() !== "false";

    if (!allowedEmailDomain) {
        throw new Error("Missing or empty STUDENT_ALLOWED_EMAIL_DOMAIN");
    }

    return {
        url,
        anonKey,
        allowedEmailDomain,
        rateLimitEnabled,
    };
}
