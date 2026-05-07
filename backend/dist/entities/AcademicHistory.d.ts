import { Student } from './Student';
export declare enum AcademicHistoryStatus {
    IN_PROGRESS = "in_progress",
    APPROVED = "approved",
    FAILED = "failed",
    RECOVERY = "recovery",
    CANCELLED = "cancelled"
}
export declare class AcademicHistory {
    id: string;
    studentId: string;
    student: Student;
    disciplineId: string;
    discipline: string;
    disciplineName: string;
    courseName: string;
    year: number;
    period: number;
    grade: number;
    status: AcademicHistoryStatus;
    workload: number;
    attendancePercentage: number;
    completionDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=AcademicHistory.d.ts.map