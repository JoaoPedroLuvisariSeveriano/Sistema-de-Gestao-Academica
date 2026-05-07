import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class TeacherController {
    create: (req: AuthRequest, res: Response) => Promise<Response>;
    findAll: (req: AuthRequest, res: Response) => Promise<Response>;
    findById: (req: AuthRequest, res: Response) => Promise<Response>;
    update: (req: AuthRequest, res: Response) => Promise<Response>;
    assignToDiscipline: (req: AuthRequest, res: Response) => Promise<Response>;
}
//# sourceMappingURL=TeacherController.d.ts.map