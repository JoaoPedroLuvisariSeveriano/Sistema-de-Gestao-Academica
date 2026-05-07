import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class GradeController {
    createOrUpdate(req: AuthRequest, res: Response): Promise<Response>;
    updateAttendance(req: AuthRequest, res: Response): Promise<Response>;
    getAverage(req: AuthRequest, res: Response): Promise<Response>;
    getStudentStatus(req: AuthRequest, res: Response): Promise<Response>;
    findByDiscipline(req: AuthRequest, res: Response): Promise<Response>;
    findByStudent(req: AuthRequest, res: Response): Promise<Response>;
    private computeAverage;
    private computeStatus;
    private updateAcademicHistory;
    private mapStatus;
}
//# sourceMappingURL=GradeController.d.ts.map