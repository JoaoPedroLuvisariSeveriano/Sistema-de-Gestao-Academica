import { DisciplineEnrollment } from './DisciplineEnrollment';
import { User } from './User';
export declare enum TeacherStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare class Teacher {
    id: string;
    cpf: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    titulation: string;
    formation: string;
    status: TeacherStatus;
    createdAt: Date;
    updatedAt: Date;
    disciplineEnrollments: DisciplineEnrollment[];
    users: User[];
}
//# sourceMappingURL=Teacher.d.ts.map