"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EnrollmentController_1 = require("../controllers/EnrollmentController");
const router = (0, express_1.Router)();
const enrollmentController = new EnrollmentController_1.EnrollmentController();
// RF#18 - Matrícula em cursos (permitido sem autenticação para demo)
router.post('/', enrollmentController.enrollInCourse);
// RF#19 - Matrícula em disciplinas por período letivo (permitido sem autenticação para demo)
router.post('/:id/disciplines', enrollmentController.enrollInDiscipline);
// RF#21 - Cancelamento de matrícula em disciplinas (permitido sem autenticação para demo)
router.delete('/:id/disciplines/:disciplineId', enrollmentController.cancelDisciplineEnrollment);
// RF#22 - Registro de histórico de matrículas (permitido sem autenticação para demo)
router.get('/:id/history', enrollmentController.getEnrollmentHistory);
// Get student enrollments (permitido sem autenticação para demo)
router.get('/student/:studentId', enrollmentController.getStudentEnrollments);
// Get all enrollments (permitido sem autenticação para demo)
router.get('/', enrollmentController.findAll);
// Get all discipline enrollments for grade entry
router.get('/discipline-enrollments', enrollmentController.getAllDisciplineEnrollments);
exports.default = router;
//# sourceMappingURL=enrollment.routes.js.map