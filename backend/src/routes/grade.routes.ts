import { Router, Response } from 'express';
import { GradeController } from '../controllers/GradeController';

const router = Router();
const gradeController = new GradeController();

// RF#23 - Lançamento de notas (permitido sem autenticação para demo)
router.post('/', gradeController.createOrUpdate);

// RF#24 - Registro de frequência (permitido sem autenticação para demo)
router.put('/:disciplineEnrollmentId/attendance', gradeController.updateAttendance);

// RF#25 - Cálculo automático da média final (permitido sem autenticação para demo)
router.get('/:disciplineEnrollmentId/average', gradeController.getAverage);

// RF#26 - Indicação da situação do aluno (permitido sem autenticação para demo)
router.get('/:disciplineEnrollmentId/status', gradeController.getStudentStatus);

// Get grades by discipline (permitido sem autenticação para demo)
router.get('/discipline/:disciplineId', gradeController.findByDiscipline);

// Get student grades (permitido sem autenticação para demo)
router.get('/student/:studentId', gradeController.findByStudent);

export default router;

