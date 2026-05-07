import { Enrollment } from './Enrollment';
import { AcademicHistory } from './AcademicHistory';
import { User } from './User';
export declare enum StudentStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    GRADUATED = "graduated"
}
export declare class Student {
    id: string;
    cpf: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    birthDate: Date;
    registrationNumber: string;
    status: StudentStatus;
    inactiveReason: string;
    inactiveDate: Date;
    createdAt: Date;
    updatedAt: Date;
    enrollments: Enrollment[];
    academicHistory: AcademicHistory[];
    users: User[];
}
//# sourceMappingURL=Student.d.ts.map