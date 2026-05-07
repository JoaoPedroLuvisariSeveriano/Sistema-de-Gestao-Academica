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
exports.Grade = exports.GradeStatus = void 0;
const typeorm_1 = require("typeorm");
const DisciplineEnrollment_1 = require("./DisciplineEnrollment");
var GradeStatus;
(function (GradeStatus) {
    GradeStatus["IN_PROGRESS"] = "in_progress";
    GradeStatus["APPROVED"] = "approved";
    GradeStatus["FAILED"] = "failed";
    GradeStatus["RECOVERY"] = "recovery";
})(GradeStatus || (exports.GradeStatus = GradeStatus = {}));
let Grade = class Grade {
};
exports.Grade = Grade;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Grade.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Grade.prototype, "disciplineEnrollmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => DisciplineEnrollment_1.DisciplineEnrollment, (de) => de.id),
    (0, typeorm_1.JoinColumn)({ name: 'disciplineEnrollmentId' }),
    __metadata("design:type", DisciplineEnrollment_1.DisciplineEnrollment)
], Grade.prototype, "disciplineEnrollment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Grade.prototype, "grade1", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Grade.prototype, "grade2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Grade.prototype, "grade3", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Grade.prototype, "finalGrade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Grade.prototype, "average", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Grade.prototype, "attendance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Grade.prototype, "attendedClasses", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 100 }),
    __metadata("design:type", Number)
], Grade.prototype, "totalClasses", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Grade.prototype, "attendancePercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: GradeStatus,
        default: GradeStatus.IN_PROGRESS,
    }),
    __metadata("design:type", String)
], Grade.prototype, "finalStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Grade.prototype, "lastAttendanceUpdate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Grade.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Grade.prototype, "updatedAt", void 0);
exports.Grade = Grade = __decorate([
    (0, typeorm_1.Entity)('grades')
], Grade);
//# sourceMappingURL=Grade.js.map