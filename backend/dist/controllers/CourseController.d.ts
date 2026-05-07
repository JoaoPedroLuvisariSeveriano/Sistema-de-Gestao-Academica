import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class CourseController {
    create: (req: AuthRequest, res: Response) => Promise<Response>;
    findAll: (req: AuthRequest, res: Response) => Promise<Response>;
    findById: (req: AuthRequest, res: Response) => Promise<Response>;
    update: (req: AuthRequest, res: Response) => Promise<Response>;
    toggleStatus: (req: AuthRequest, res: Response) => Promise<Response>;
    addDiscipline: (req: AuthRequest, res: Response) => Promise<Response>;
}
//# sourceMappingURL=CourseController.d.ts.map