import { Router, Response } from 'express';
import { DocumentController } from '../controllers/DocumentController';

const router = Router();
const documentController = new DocumentController();

// RF#28 - Geração de histórico escolar (permitido sem autenticação para demo)
router.get('/transcript/:studentId', documentController.generateTranscript);

// RF#29 - Emissão de declaração de matrícula (permitido sem autenticação para demo)
router.get('/enrollment-certificate/:studentId', documentController.generateEnrollmentCertificate);

// RF#30 - Emissão de boleto acadêmico (permitido sem autenticação para demo)
router.get('/boletim/:studentId/:period', documentController.generateBoletim);

// RF#31 - Emissão de certificados e declarações (permitido sem autenticação para demo)
router.get('/certificate/:studentId', documentController.generateCertificate);

export default router;

