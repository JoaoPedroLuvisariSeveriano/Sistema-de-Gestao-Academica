"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DocumentController_1 = require("../controllers/DocumentController");
const router = (0, express_1.Router)();
const documentController = new DocumentController_1.DocumentController();
// RF#28 - Geração de histórico escolar (permitido sem autenticação para demo)
router.get('/transcript/:studentId', documentController.generateTranscript);
// RF#29 - Emissão de declaração de matrícula (permitido sem autenticação para demo)
router.get('/enrollment-certificate/:studentId', documentController.generateEnrollmentCertificate);
// RF#30 - Emissão de boleto acadêmico (permitido sem autenticação para demo)
router.get('/boletim/:studentId/:period', documentController.generateBoletim);
// RF#31 - Emissão de certificados e declarações (permitido sem autenticação para demo)
router.get('/certificate/:studentId', documentController.generateCertificate);
exports.default = router;
//# sourceMappingURL=document.routes.js.map