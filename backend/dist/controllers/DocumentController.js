"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const database_1 = require("../config/database");
const Student_1 = require("../entities/Student");
const Enrollment_1 = require("../entities/Enrollment");
const DisciplineEnrollment_1 = require("../entities/DisciplineEnrollment");
const AcademicHistory_1 = require("../entities/AcademicHistory");
const pdfGenerator_1 = require("../utils/pdfGenerator");
const uuid_1 = require("uuid");
const pdfkit_1 = __importDefault(require("pdfkit"));
class DocumentController {
    constructor() {
        this.studentRepository = database_1.AppDataSource.getRepository(Student_1.Student);
        this.enrollmentRepository = database_1.AppDataSource.getRepository(Enrollment_1.Enrollment);
        this.disciplineEnrollmentRepository = database_1.AppDataSource.getRepository(DisciplineEnrollment_1.DisciplineEnrollment);
        this.academicHistoryRepository = database_1.AppDataSource.getRepository(AcademicHistory_1.AcademicHistory);
    }
    // RF#28 - Geração de histórico escolar
    async generateTranscript(req, res) {
        try {
            const { studentId } = req.params;
            const student = await this.studentRepository.findOne({
                where: { id: studentId },
            });
            if (!student) {
                return res.status(404).json({ error: 'Aluno não encontrado' });
            }
            // Buscar histórico acadêmico completo
            const academicHistory = await this.academicHistoryRepository.find({
                where: { studentId },
                relations: ['discipline'],
                order: { year: 'ASC', period: 'ASC' },
            });
            // Gerar código de verificação digital
            const verificationCode = (0, uuid_1.v4)().substring(0, 8).toUpperCase();
            // Gerar PDF
            const pdfBuffer = await (0, pdfGenerator_1.generateTranscriptPDF)(student, academicHistory, verificationCode);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=historico_${student.registrationNumber}.pdf`);
            return res.send(pdfBuffer);
        }
        catch (error) {
            console.error('Erro ao gerar histórico escolar:', error);
            return res.status(500).json({ error: error.message || 'Erro ao gerar histórico escolar' });
        }
    }
    // RF#29 - Emissão de declaração de matrícula
    async generateEnrollmentCertificate(req, res) {
        try {
            const { studentId } = req.params;
            const { period, year } = req.query;
            const student = await this.studentRepository.findOne({
                where: { id: studentId },
            });
            if (!student) {
                return res.status(404).json({ error: 'Aluno não encontrado' });
            }
            // Buscar matrícula ativa - procurar por status ativo
            const enrollments = await this.enrollmentRepository.find({
                where: { studentId },
                relations: ['course'],
            });
            // Filtrar matrículas ativas - comparar como string
            const activeEnrollment = enrollments.find((e) => {
                // Handle both string and enum status values
                const status = String(e.status);
                return status === 'active' || status === 'EnrollmentStatus.ACTIVE';
            });
            if (!activeEnrollment) {
                return res.status(404).json({ error: 'Matrícula ativa não encontrada' });
            }
            // Gerar código de verificação digital
            const verificationCode = (0, uuid_1.v4)().substring(0, 8).toUpperCase();
            // Gerar PDF
            const pdfBuffer = await this.generateCertificatePDF(student, activeEnrollment, verificationCode, 'DECLARAÇÃO DE MATRÍCULA');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=declaracao_matricula_${student.registrationNumber}.pdf`);
            return res.send(pdfBuffer);
        }
        catch (error) {
            console.error('Erro ao gerar declaração de matrícula:', error);
            return res.status(500).json({ error: error.message || 'Erro ao gerar declaração de matrícula' });
        }
    }
    // RF#30 - Emissão de boleto acadêmico
    async generateBoletim(req, res) {
        try {
            const { studentId, period } = req.params;
            const { year } = req.query;
            const student = await this.studentRepository.findOne({
                where: { id: studentId },
            });
            if (!student) {
                return res.status(404).json({ error: 'Aluno não encontrado' });
            }
            // Buscar disciplinas do período
            const disciplineEnrollments = await this.disciplineEnrollmentRepository
                .createQueryBuilder('de')
                .innerJoin('de.enrollment', 'enrollment')
                .innerJoin('de.discipline', 'discipline')
                .leftJoinAndSelect('de.grades', 'grade')
                .where('enrollment.studentId = :studentId', { studentId })
                .andWhere('de.period = :period', { period: parseInt(period) })
                .andWhere('de.year = :year', { year: parseInt(year) || new Date().getFullYear() })
                .getMany();
            // Gerar código de verificação digital
            const verificationCode = (0, uuid_1.v4)().substring(0, 8).toUpperCase();
            // Gerar PDF
            const pdfBuffer = await this.generateBoletimPDF(student, disciplineEnrollments, parseInt(period), parseInt(year) || new Date().getFullYear(), verificationCode);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=boletim_${student.registrationNumber}_${period}${year}.pdf`);
            return res.send(pdfBuffer);
        }
        catch (error) {
            console.error('Erro ao gerar boleto acadêmico:', error);
            return res.status(500).json({ error: error.message || 'Erro ao gerar boleto acadêmico' });
        }
    }
    // RF#31 - Emissão de certificados e declarações
    async generateCertificate(req, res) {
        try {
            const { studentId } = req.params;
            const { type = 'completion' } = req.query;
            const student = await this.studentRepository.findOne({
                where: { id: studentId },
            });
            if (!student) {
                return res.status(404).json({ error: 'Aluno não encontrado' });
            }
            // Buscar histórico para verificar conclusão do curso
            const academicHistory = await this.academicHistoryRepository.find({
                where: { studentId },
            });
            const completedDisciplines = academicHistory.filter(h => {
                // Handle both string and enum status values
                const status = String(h.status);
                return status === 'approved' || status === 'AcademicHistoryStatus.APPROVED';
            });
            const hasCompleted = completedDisciplines.length > 0;
            // Gerar código de verificação digital
            const verificationCode = (0, uuid_1.v4)().substring(0, 8).toUpperCase();
            let certificateType = 'CERTIFICADO DE CONCLUSÃO';
            if (type === 'participation') {
                certificateType = 'CERTIFICADO DE PARTICIPAÇÃO';
            }
            // Gerar PDF
            const pdfBuffer = await this.generateCertificatePDF(student, null, verificationCode, certificateType, hasCompleted);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=certificado_${student.registrationNumber}.pdf`);
            return res.send(pdfBuffer);
        }
        catch (error) {
            console.error('Erro ao gerar certificado:', error);
            return res.status(500).json({ error: error.message || 'Erro ao gerar certificado' });
        }
    }
    // Métodos auxiliares para gerar PDFs
    async generateCertificatePDF(student, enrollment, verificationCode, title, hasCompleted) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                // Cabeçalho
                doc.fontSize(18).font('Helvetica-Bold').text('INSTITUIÇÃO DE ENSINO', { align: 'center' });
                doc.moveDown();
                doc.fontSize(14).font('Helvetica').text('SISTEMA DE GESTÃO ACADÊMICA', { align: 'center' });
                doc.moveDown(2);
                // Título do documento
                doc.fontSize(16).font('Helvetica-Bold').text(title, { align: 'center' });
                doc.moveDown(2);
                // Conteúdo
                doc.fontSize(12).font('Helvetica');
                doc.text(`Nome do Aluno: ${student.name}`);
                doc.text(`CPF: ${student.cpf}`);
                doc.text(`Matrícula: ${student.registrationNumber}`);
                if (enrollment && enrollment.course) {
                    doc.text(`Curso: ${enrollment.course.name}`);
                    doc.text(`Período: ${enrollment.period}º Semestre / ${enrollment.year}`);
                }
                doc.moveDown();
                doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`);
                doc.moveDown(2);
                // Código de verificação
                doc.fontSize(10).font('Helvetica-Oblique');
                doc.text(`Código de Verificação: ${verificationCode}`, { align: 'center' });
                doc.moveDown();
                doc.text('Este documento pode ser verificado no site oficial da instituição.', { align: 'center' });
                doc.end();
            }
            catch (error) {
                reject(error);
            }
        });
    }
    async generateBoletimPDF(student, disciplineEnrollments, period, year, verificationCode) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                // Cabeçalho
                doc.fontSize(18).font('Helvetica-Bold').text('INSTITUIÇÃO DE ENSINO', { align: 'center' });
                doc.moveDown();
                doc.fontSize(14).font('Helvetica').text('BOLETIM ACADÊMICO', { align: 'center' });
                doc.moveDown(2);
                // Dados do aluno
                doc.fontSize(12).font('Helvetica');
                doc.text(`Nome: ${student.name}`);
                doc.text(`Matrícula: ${student.registrationNumber}`);
                doc.text(`Período: ${period}º Semestre / ${year}`);
                doc.moveDown(2);
                // Tabela de disciplinas
                doc.fontSize(10).font('Helvetica-Bold');
                doc.text('Disciplina', 50, doc.y, { continued: true, width: 200 });
                doc.text('Nota 1', 250, doc.y - 10, { continued: true, width: 60 });
                doc.text('Nota 2', 310, doc.y - 20, { continued: true, width: 60 });
                doc.text('Média', 370, doc.y - 30, { continued: true, width: 60 });
                doc.text('Frequência', 430, doc.y - 40, { width: 80 });
                doc.moveDown();
                doc.font('Helvetica').fontSize(10);
                if (disciplineEnrollments.length === 0) {
                    doc.text('Nenhuma disciplina encontrada para este período.');
                }
                else {
                    disciplineEnrollments.forEach((de) => {
                        const grade = de.grades && de.grades[0];
                        const disciplineName = de.discipline?.name || 'Disciplina';
                        doc.text(disciplineName.substring(0, 30), 50, doc.y, { continued: true, width: 200 });
                        doc.text(grade?.grade1?.toFixed(1) || '-', 250, doc.y, { continued: true, width: 60 });
                        doc.text(grade?.grade2?.toFixed(1) || '-', 310, doc.y, { continued: true, width: 60 });
                        doc.text(grade?.average?.toFixed(1) || '-', 370, doc.y, { continued: true, width: 60 });
                        doc.text(`${grade?.attendancePercentage?.toFixed(0) || 0}%`, 430, doc.y, { width: 80 });
                        doc.moveDown();
                    });
                }
                doc.moveDown(2);
                // Código de verificação
                doc.fontSize(10).font('Helvetica-Oblique');
                doc.text(`Código de Verificação: ${verificationCode}`, { align: 'center' });
                doc.end();
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.DocumentController = DocumentController;
//# sourceMappingURL=DocumentController.js.map