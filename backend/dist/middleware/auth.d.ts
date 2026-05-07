import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../entities/User';
export { UserRole };
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: UserRole;
    };
}
export declare function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function authorizeRoles(...roles: UserRole[]): (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare function generateToken(user: {
    id: string;
    email: string;
    role: UserRole;
}): string;
//# sourceMappingURL=auth.d.ts.map