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
exports.Discipline = exports.DisciplineStatus = void 0;
const typeorm_1 = require("typeorm");
const Course_1 = require("./Course");
const DisciplineEnrollment_1 = require("./DisciplineEnrollment");
var DisciplineStatus;
(function (DisciplineStatus) {
    DisciplineStatus["ACTIVE"] = "active";
    DisciplineStatus["INACTIVE"] = "inactive";
})(DisciplineStatus || (exports.DisciplineStatus = DisciplineStatus = {}));
let Discipline = class Discipline {
};
exports.Discipline = Discipline;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Discipline.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Discipline.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Discipline.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Discipline.prototype, "ementa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Discipline.prototype, "workload", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Discipline.prototype, "credits", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Discipline.prototype, "period", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DisciplineStatus,
        default: DisciplineStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Discipline.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Discipline.prototype, "courseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course, (course) => course.disciplines),
    (0, typeorm_1.JoinColumn)({ name: 'courseId' }),
    __metadata("design:type", Course_1.Course)
], Discipline.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], Discipline.prototype, "prerequisiteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Discipline, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'prerequisiteId' }),
    __metadata("design:type", Discipline)
], Discipline.prototype, "prerequisite", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { array: true, nullable: true }),
    __metadata("design:type", Array)
], Discipline.prototype, "prerequisiteIds", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DisciplineEnrollment_1.DisciplineEnrollment, (de) => de.discipline),
    __metadata("design:type", Array)
], Discipline.prototype, "disciplineEnrollments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Discipline.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Discipline.prototype, "updatedAt", void 0);
exports.Discipline = Discipline = __decorate([
    (0, typeorm_1.Entity)('disciplines')
], Discipline);
//# sourceMappingURL=Discipline.js.map