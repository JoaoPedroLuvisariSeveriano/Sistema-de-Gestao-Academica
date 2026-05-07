"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StudentController_1 = require("../controllers/StudentController");
const router = (0, express_1.Router)();
const studentController = new StudentController_1.StudentController();
// RF#01 - Cadastro de alunos (permitido sem autenticação para demo)
router.post('/register', studentController.create);
// RF#04 - Consulta de alunos (com filtros) - permitid sem autenticação para demo
router.get('/', studentController.findAll);
// RF#02 - Edição de dados do aluno - permitid sem autenticação para demo
router.put('/:id', studentController.update);
// RF#03 - Inativação ou desligamento de alunos - permitid sem autenticação para demo
router.delete('/:id', studentController.inactivate);
// Consulta por ID
router.get('/:id', studentController.findById);
// Geração de número de matrícula (utilizado internamente)
router.get('/registration/generate', studentController.generateRegistrationNumber);
exports.default = router;
//# sourceMappingURL=student.routes.js.map