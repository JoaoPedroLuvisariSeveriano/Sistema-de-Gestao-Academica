import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class StudentController {
    create: (req: Request, res: Response) => Promise<Response>;
    findAll: (req: AuthRequest, res: Response) => Promise<Response>;
    findById: (req: Request, res: Response) => Promise<Response>;
    update: (req: AuthRequest, res: Response) => Promise<Response>;
    inactivate: (req: AuthRequest, res: Response) => Promise<Response>;
    generateRegistrationNumber(studentRepository: any): Promise<string>;
}
//# sourceMappingURL=StudentController.d.ts.map