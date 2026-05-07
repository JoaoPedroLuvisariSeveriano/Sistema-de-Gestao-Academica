import { Student } from '../entities/Student';
import { AcademicHistory } from '../entities/AcademicHistory';
export declare function generateTranscriptPDF(student: Student, academicHistory: AcademicHistory[], verificationCode: string): Promise<Buffer>;
export declare function generateVerificationCode(): string;
//# sourceMappingURL=pdfGenerator.d.ts.map