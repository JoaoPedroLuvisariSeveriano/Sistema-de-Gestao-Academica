import { Router, Response } from 'express';
import { CourseController } from '../controllers/CourseController';

const router = Router();
const courseController = new CourseController();

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

export default router;

