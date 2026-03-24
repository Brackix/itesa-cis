import { StudentAuthService } from "./studentAuth.service";

export class StudentLoginService {
    private readonly authService = new StudentAuthService();

    async login(email: string, password: string, ip?: string) {
        return this.authService.login(email, password, ip);
    }

    // Legacy alias for future compatibility.
    async loginWithEmail(email: string, password: string, ip?: string) {
        return this.authService.login(email, password, ip);
    }
}
