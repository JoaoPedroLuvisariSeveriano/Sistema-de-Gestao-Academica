"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CourseController_1 = require("../controllers/CourseController");
const router = (0, express_1.Router)();
const courseController = new CourseController_1.CourseController();
// RF#10 - Cadastro de cursos (permitido sem autenticação para demo)
router.post('/', courseController.create);
// RF#13 - Ativação ou desativação de cursos (permitido sem autenticação para demo)
router.put('/:id/status', courseController.toggleStatus);
// RF#11 - Vinculação de disciplinas aos cursos (permitido sem autenticação para demo)
router.post('/:id/disciplines', courseController.addDiscipline);
// RF#12 - Definição de carga horária total (permitido sem autenticação para demo)
router.put('/:id', courseController.update);
// Consulta de cursos (permitido sem autenticação para demo)
router.get('/', courseController.findAll);
router.get('/:id', courseController.findById);
exports.default = router;
//# sourceMappingURL=course.routes.js.map