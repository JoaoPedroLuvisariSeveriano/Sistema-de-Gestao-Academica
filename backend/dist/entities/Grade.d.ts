import { DisciplineEnrollment } from './DisciplineEnrollment';
export declare enum GradeStatus {
    IN_PROGRESS = "in_progress",
    APPROVED = "approved",
    FAILED = "failed",
    RECOVERY = "recovery"
}
export declare class Grade {
    id: string;
    disciplineEnrollmentId: string;
    disciplineEnrollment: DisciplineEnrollment;
    grade1: number;
    grade2: number;
    grade3: number;
    finalGrade: number;
    average: number;
    attendance: number;
    attendedClasses: number;
    totalClasses: number;
    attendancePercentage: number;
    finalStatus: GradeStatus;
    lastAttendanceUpdate: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=Grade.d.ts.map