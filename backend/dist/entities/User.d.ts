import { Student } from './Student';
import { Teacher } from './Teacher';
export declare enum UserRole {
    ADMIN = "admin",
    SECRETARY = "secretary",
    COORDINATOR = "coordinator",
    TEACHER = "teacher",
    STUDENT = "student"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    role: UserRole;
    studentId: string;
    student: Student;
    teacherId: string;
    teacher: Teacher;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date;
}
//# sourceMappingURL=User.d.ts.map