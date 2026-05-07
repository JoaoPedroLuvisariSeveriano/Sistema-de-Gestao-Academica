import { Router, Response } from 'express';
import { DisciplineController } from '../controllers/DisciplineController';

const router = Router();
const disciplineController = new DisciplineController();

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

export default router;

