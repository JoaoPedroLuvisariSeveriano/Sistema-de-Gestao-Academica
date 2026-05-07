import { Student } from './Student';
import { Course } from './Course';
import { DisciplineEnrollment } from './DisciplineEnrollment';
export declare enum EnrollmentStatus {
    ACTIVE = "active",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    SUSPENDED = "suspended"
}
export declare class Enrollment {
    id: string;
    studentId: string;
    student: Student;
    courseId: string;
    course: Course;
    period: number;
    year: number;
    status: EnrollmentStatus;
    cancellationDate: Date;
    cancellationReason: string;
    disciplineEnrollments: DisciplineEnrollment[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=Enrollment.d.ts.map