"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTranscriptPDF = generateTranscriptPDF;
exports.generateVerificationCode = generateVerificationCode;
const pdfkit_1 = __importDefault(require("pdfkit"));
async function generateTranscriptPDF(student, academicHistory, verificationCode) {
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
            // Título
            doc.fontSize(16).font('Helvetica-Bold').text('HISTÓRICO ESCOLAR', { align: 'center' });
            doc.moveDown(2);
            // Dados do aluno
            doc.fontSize(12).font('Helvetica');
            doc.text(`Nome do Aluno: ${student.name}`);
            doc.text(`CPF: ${student.cpf}`);
            doc.text(`Matrícula: ${student.registrationNumber}`);
            doc.text(`Data de Nascimento: ${student.birthDate ? new Date(student.birthDate).toLocaleDateString('pt-BR') : 'N/A'}`);
            doc.moveDown(2);
            // Tabela de disciplinas
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Ano', 50, doc.y, { continued: true, width: 40 });
            doc.text('Período', 90, doc.y - 10, { continued: true, width: 50 });
            doc.text('Disciplina', 140, doc.y - 20, { continued: true, width: 180 });
            doc.text('Nota', 320, doc.y - 30, { continued: true, width: 50 });
            doc.text('Frequência', 370, doc.y - 40, { continued: true, width: 70 });
            doc.text('Situação', 440, doc.y - 50, { width: 80 });
            doc.moveDown();
            // Linhas de dados
            doc.font('Helvetica').fontSize(9);
            academicHistory.forEach((history) => {
                const status = history.status === 'approved' ? 'Aprovado' :
                    history.status === 'failed' ? 'Reprovado' :
                        history.status === 'recovery' ? 'Recuperação' : 'Em Andamento';
                doc.text(history.year.toString(), 50, doc.y, { continued: true, width: 40 });
                doc.text(history.period.toString(), 90, doc.y, { continued: true, width: 50 });
                doc.text((history.disciplineName || 'N/A').substring(0, 25), 140, doc.y, { continued: true, width: 180 });
                doc.text(history.grade?.toFixed(1) || '-', 320, doc.y, { continued: true, width: 50 });
                doc.text(`${history.attendancePercentage || 0}%`, 370, doc.y, { continued: true, width: 70 });
                doc.text(status, 440, doc.y, { width: 80 });
                doc.moveDown();
            });
            doc.moveDown(2);
            // Resumo
            const approvedCount = academicHistory.filter(h => h.status === 'approved').length;
            const failedCount = academicHistory.filter(h => h.status === 'failed').length;
            const inProgressCount = academicHistory.filter(h => h.status === 'in_progress').length;
            doc.fontSize(10).font('Helvetica');
            doc.text(`Total de Disciplinas: ${academicHistory.length}`);
            doc.text(`Aprovadas: ${approvedCount}`);
            doc.text(`Reprovadas: ${failedCount}`);
            doc.text(`Em Andamento: ${inProgressCount}`);
            doc.moveDown(2);
            // Data e código de verificação
            doc.fontSize(10).font('Helvetica-Oblique');
            doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
            doc.moveDown();
            doc.text(`Código de Verificação: ${verificationCode}`, { align: 'center' });
            doc.moveDown();
            doc.text('Este documento pode ser verificado no site oficial da instituição.', { align: 'center' });
            // Assinaturas
            doc.moveDown(3);
            doc.fontSize(10).font('Helvetica');
            doc.text('_'.repeat(40), 50, doc.y, { align: 'center' });
            doc.text('Secretário Acadêmico', { align: 'center' });
            doc.moveDown();
            doc.text('_'.repeat(40), 50, doc.y, { align: 'center' });
            doc.text('Coordenador do Curso', { align: 'center' });
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
function generateVerificationCode() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp}${random}`.substring(0, 12).toUpperCase();
}
//# sourceMappingURL=pdfGenerator.js.map