import { Router, Response } from 'express';
import { TeacherController } from '../controllers/TeacherController';

const router = Router();
const teacherController = new TeacherController();

// RF#06 - Cadastro de professores (permitido sem autenticação para demo)
router.post('/', teacherController.create);

// RF#09 - Consulta de professores (permitido sem autenticação para demo)
router.get('/', teacherController.findAll);

router.get('/:id', teacherController.findById);

// RF#08 - Edição de dados dos professores (permitido sem autenticação para demo)
router.put('/:id', teacherController.update);

// RF#07 - Vinculação de professores às disciplinas (permitido sem autenticação para demo)
router.post('/:id/disciplines', teacherController.assignToDiscipline);

export default router;

