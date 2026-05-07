"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DisciplineController_1 = require("../controllers/DisciplineController");
const router = (0, express_1.Router)();
const disciplineController = new DisciplineController_1.DisciplineController();
// RF#14 - Cadastro de disciplinas (permitido sem autenticação para demo)
router.post('/', disciplineController.create);
// RF#15 - Definição de carga horária da disciplina
// RF#16 - Definição de pré-requisitos
// RF#17 - Vinculação de disciplina ao curso (permitido sem autenticação para demo)
router.put('/:id', disciplineController.update);
// Consulta de disciplinas (permitido sem autenticação para demo)
router.get('/', disciplineController.findAll);
router.get('/:id', disciplineController.findById);
// Get disciplines by course (permitido sem autenticação para demo)
router.get('/course/:courseId', disciplineController.findByCourse);
exports.default = router;
//# sourceMappingURL=discipline.routes.js.map