import { StudentAuthService } from "./studentAuth.service";

type VerifySignupPayload = {
    email: unknown;
    code: unknown;
    password: unknown;
    firstName: unknown;
    lastName: unknown;
    sectionId: unknown;
    studentCode: unknown;
};

export class StudentSignUpService {
    private readonly authService = new StudentAuthService();

    async requestCode(email: unknown, ip?: string) {
        return this.authService.requestSignupCode(email, ip);
    }

    async verifySignUp(payload: VerifySignupPayload, ip?: string) {
        return this.authService.verifySignup(payload, ip);
    }

    // Legacy method kept to avoid import breaks in old callers.
    async signUp(_studentCode: string, _password: string) {
        throw new Error(
            "Método legacy descontinuado. Usa requestCode(email) y verifySignUp({ email, code, password, firstName, lastName, sectionId, studentCode }).",
        );
    }
}
