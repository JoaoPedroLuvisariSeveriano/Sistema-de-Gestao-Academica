"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisciplineEnrollment = exports.DisciplineEnrollmentStatus = void 0;
const typeorm_1 = require("typeorm");
const Enrollment_1 = require("./Enrollment");
const Discipline_1 = require("./Discipline");
const Teacher_1 = require("./Teacher");
const Grade_1 = require("./Grade");
var DisciplineEnrollmentStatus;
(function (DisciplineEnrollmentStatus) {
    DisciplineEnrollmentStatus["ACTIVE"] = "active";
    DisciplineEnrollmentStatus["CANCELLED"] = "cancelled";
    DisciplineEnrollmentStatus["COMPLETED"] = "completed";
})(DisciplineEnrollmentStatus || (exports.DisciplineEnrollmentStatus = DisciplineEnrollmentStatus = {}));
let DisciplineEnrollment = class DisciplineEnrollment {
};
exports.DisciplineEnrollment = DisciplineEnrollment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DisciplineEnrollment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], DisciplineEnrollment.prototype, "enrollmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Enrollment_1.Enrollment, (enrollment) => enrollment.disciplineEnrollments),
    (0, typeorm_1.JoinColumn)({ name: 'enrollmentId' }),
    __metadata("design:type", Enrollment_1.Enrollment)
], DisciplineEnrollment.prototype, "enrollment", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], DisciplineEnrollment.prototype, "disciplineId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Discipline_1.Discipline, (discipline) => discipline.disciplineEnrollments),
    (0, typeorm_1.JoinColumn)({ name: 'disciplineId' }),
    __metadata("design:type", Discipline_1.Discipline)
], DisciplineEnrollment.prototype, "discipline", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], DisciplineEnrollment.prototype, "teacherId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Teacher_1.Teacher, (teacher) => teacher.disciplineEnrollments),
    (0, typeorm_1.JoinColumn)({ name: 'teacherId' }),
    __metadata("design:type", Teacher_1.Teacher)
], DisciplineEnrollment.prototype, "teacher", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], DisciplineEnrollment.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], DisciplineEnrollment.prototype, "period", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DisciplineEnrollmentStatus,
        default: DisciplineEnrollmentStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], DisciplineEnrollment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], DisciplineEnrollment.prototype, "cancellationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DisciplineEnrollment.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Grade_1.Grade, (grade) => grade.disciplineEnrollment),
    __metadata("design:type", Array)
], DisciplineEnrollment.prototype, "grades", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DisciplineEnrollment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], DisciplineEnrollment.prototype, "updatedAt", void 0);
exports.DisciplineEnrollment = DisciplineEnrollment = __decorate([
    (0, typeorm_1.Entity)('discipline_enrollments')
], DisciplineEnrollment);
//# sourceMappingURL=DisciplineEnrollment.js.map