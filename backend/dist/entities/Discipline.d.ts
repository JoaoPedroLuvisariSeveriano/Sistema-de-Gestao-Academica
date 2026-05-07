import { Course } from './Course';
import { DisciplineEnrollment } from './DisciplineEnrollment';
export declare enum DisciplineStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare class Discipline {
    id: string;
    name: string;
    description: string;
    ementa: string;
    workload: number;
    credits: number;
    period: number;
    status: DisciplineStatus;
    courseId: string;
    course: Course;
    prerequisiteId: string;
    prerequisite: Discipline;
    prerequisiteIds: string[];
    disciplineEnrollments: DisciplineEnrollment[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=Discipline.d.ts.map