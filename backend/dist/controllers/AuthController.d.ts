import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class AuthController {
    login(req: AuthRequest, res: Response): Promise<Response>;
    register(req: AuthRequest, res: Response): Promise<Response>;
    getCurrentUser(req: AuthRequest, res: Response): Promise<Response>;
    changePassword(req: AuthRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=AuthController.d.ts.map