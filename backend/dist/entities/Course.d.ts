import { Discipline } from './Discipline';
import { Enrollment } from './Enrollment';
export declare enum CourseModality {
    PRESENCIAL = "Presencial",
    EAD = "EAD",
    HIBRIDO = "H\u00EDbrido"
}
export declare enum CourseType {
    GRADUACAO = "graduacao",
    POS_GRADUACAO = "pos_graduacao",
    TECNICO = "tecnico",
    LIVRE = "livre"
}
export declare enum CourseStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare class Course {
    id: string;
    name: string;
    description: string;
    workload: number;
    modality: CourseModality;
    type: CourseType;
    status: CourseStatus;
    createdAt: Date;
    updatedAt: Date;
    disciplines: Discipline[];
    enrollments: Enrollment[];
}
//# sourceMappingURL=Course.d.ts.map