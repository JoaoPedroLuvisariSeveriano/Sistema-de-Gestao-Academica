"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TeacherController_1 = require("../controllers/TeacherController");
const router = (0, express_1.Router)();
const teacherController = new TeacherController_1.TeacherController();
// RF#06 - Cadastro de professores (permitido sem autenticação para demo)
router.post('/', teacherController.create);
// RF#09 - Consulta de professores (permitido sem autenticação para demo)
router.get('/', teacherController.findAll);
router.get('/:id', teacherController.findById);
// RF#08 - Edição de dados dos professores (permitido sem autenticação para demo)
router.put('/:id', teacherController.update);
// RF#07 - Vinculação de professores às disciplinas (permitido sem autenticação para demo)
router.post('/:id/disciplines', teacherController.assignToDiscipline);
exports.default = router;
//# sourceMappingURL=teacher.routes.js.map