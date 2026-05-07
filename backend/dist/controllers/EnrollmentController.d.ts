import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class EnrollmentController {
    enrollInCourse: (req: AuthRequest, res: Response) => Promise<Response>;
    enrollInDiscipline: (req: AuthRequest, res: Response) => Promise<Response>;
    cancelDisciplineEnrollment: (req: AuthRequest, res: Response) => Promise<Response>;
    getEnrollmentHistory: (req: AuthRequest, res: Response) => Promise<Response>;
    getStudentEnrollments: (req: AuthRequest, res: Response) => Promise<Response>;
    findAll: (req: AuthRequest, res: Response) => Promise<Response>;
    getAllDisciplineEnrollments: (req: AuthRequest, res: Response) => Promise<Response>;
}
//# sourceMappingURL=EnrollmentController.d.ts.map