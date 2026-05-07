import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class DocumentController {
    private studentRepository;
    private enrollmentRepository;
    private disciplineEnrollmentRepository;
    private academicHistoryRepository;
    generateTranscript(req: AuthRequest, res: Response): Promise<Response>;
    generateEnrollmentCertificate(req: AuthRequest, res: Response): Promise<Response>;
    generateBoletim(req: AuthRequest, res: Response): Promise<Response>;
    generateCertificate(req: AuthRequest, res: Response): Promise<Response>;
    private generateCertificatePDF;
    private generateBoletimPDF;
}
//# sourceMappingURL=DocumentController.d.ts.map