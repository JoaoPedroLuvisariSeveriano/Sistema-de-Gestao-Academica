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
exports.AcademicHistory = exports.AcademicHistoryStatus = void 0;
const typeorm_1 = require("typeorm");
const Student_1 = require("./Student");
var AcademicHistoryStatus;
(function (AcademicHistoryStatus) {
    AcademicHistoryStatus["IN_PROGRESS"] = "in_progress";
    AcademicHistoryStatus["APPROVED"] = "approved";
    AcademicHistoryStatus["FAILED"] = "failed";
    AcademicHistoryStatus["RECOVERY"] = "recovery";
    AcademicHistoryStatus["CANCELLED"] = "cancelled";
})(AcademicHistoryStatus || (exports.AcademicHistoryStatus = AcademicHistoryStatus = {}));
let AcademicHistory = class AcademicHistory {
};
exports.AcademicHistory = AcademicHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AcademicHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], AcademicHistory.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Student_1.Student, (student) => student.academicHistory),
    (0, typeorm_1.JoinColumn)({ name: 'studentId' }),
    __metadata("design:type", Student_1.Student)
], AcademicHistory.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], AcademicHistory.prototype, "disciplineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AcademicHistory.prototype, "discipline", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AcademicHistory.prototype, "disciplineName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AcademicHistory.prototype, "courseName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], AcademicHistory.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], AcademicHistory.prototype, "period", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], AcademicHistory.prototype, "grade", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AcademicHistoryStatus,
        default: AcademicHistoryStatus.IN_PROGRESS,
    }),
    __metadata("design:type", String)
], AcademicHistory.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], AcademicHistory.prototype, "workload", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], AcademicHistory.prototype, "attendancePercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], AcademicHistory.prototype, "completionDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AcademicHistory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], AcademicHistory.prototype, "updatedAt", void 0);
exports.AcademicHistory = AcademicHistory = __decorate([
    (0, typeorm_1.Entity)('academic_history')
], AcademicHistory);
//# sourceMappingURL=AcademicHistory.js.map