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
exports.Course = exports.CourseStatus = exports.CourseType = exports.CourseModality = void 0;
const typeorm_1 = require("typeorm");
const Discipline_1 = require("./Discipline");
const Enrollment_1 = require("./Enrollment");
var CourseModality;
(function (CourseModality) {
    CourseModality["PRESENCIAL"] = "Presencial";
    CourseModality["EAD"] = "EAD";
    CourseModality["HIBRIDO"] = "H\u00EDbrido";
})(CourseModality || (exports.CourseModality = CourseModality = {}));
var CourseType;
(function (CourseType) {
    CourseType["GRADUACAO"] = "graduacao";
    CourseType["POS_GRADUACAO"] = "pos_graduacao";
    CourseType["TECNICO"] = "tecnico";
    CourseType["LIVRE"] = "livre";
})(CourseType || (exports.CourseType = CourseType = {}));
var CourseStatus;
(function (CourseStatus) {
    CourseStatus["ACTIVE"] = "active";
    CourseStatus["INACTIVE"] = "inactive";
})(CourseStatus || (exports.CourseStatus = CourseStatus = {}));
let Course = class Course {
};
exports.Course = Course;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Course.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Course.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "workload", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CourseModality,
        default: CourseModality.PRESENCIAL,
    }),
    __metadata("design:type", String)
], Course.prototype, "modality", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CourseType,
        default: CourseType.GRADUACAO,
    }),
    __metadata("design:type", String)
], Course.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CourseStatus,
        default: CourseStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Course.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Course.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Course.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Discipline_1.Discipline, (discipline) => discipline.course),
    __metadata("design:type", Array)
], Course.prototype, "disciplines", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Enrollment_1.Enrollment, (enrollment) => enrollment.course),
    __metadata("design:type", Array)
], Course.prototype, "enrollments", void 0);
exports.Course = Course = __decorate([
    (0, typeorm_1.Entity)('courses')
], Course);
//# sourceMappingURL=Course.js.map