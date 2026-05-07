import { Enrollment } from './Enrollment';
import { Discipline } from './Discipline';
import { Teacher } from './Teacher';
import { Grade } from './Grade';
export declare enum DisciplineEnrollmentStatus {
    ACTIVE = "active",
    CANCELLED = "cancelled",
    COMPLETED = "completed"
}
export declare class DisciplineEnrollment {
    id: string;
    enrollmentId: string;
    enrollment: Enrollment;
    disciplineId: string;
    discipline: Discipline;
    teacherId: string;
    teacher: Teacher;
    year: number;
    period: number;
    status: DisciplineEnrollmentStatus;
    cancellationDate: Date;
    cancellationReason: string;
    grades: Grade[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=DisciplineEnrollment.d.ts.map