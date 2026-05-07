import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Student } from '../entities/Student';
import { Enrollment, EnrollmentStatus } from '../entities/Enrollment';
import { DisciplineEnrollment } from '../entities/DisciplineEnrollment';
import { Grade, GradeStatus } from '../entities/Grade';
import { AcademicHistory, AcademicHistoryStatus } from '../entities/AcademicHistory';
import { Course } from '../entities/Course';
import { Discipline } from '../entities/Discipline';
import { generateTranscriptPDF } from '../utils/pdfGenerator';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';

export class DocumentController {
  private studentRepository = AppDataSource.getRepository(Student);
  private enrollmentRepository = AppDataSource.getRepository(Enrollment);
  private disciplineEnrollmentRepository = AppDataSource.getRepository(DisciplineEnrollment);
  private gradeRepository = AppDataSource.getRepository(Grade);
  private academicHistoryRepository = AppDataSource.getRepository(AcademicHistory);
  private courseRepository = AppDataSource.getRepository(Course);
  private disciplineRepository = AppDataSource.getRepository(Discipline);

  // RF#28 - Geração de histórico escolar
  async generateTranscript(req: AuthRequest, res: Response): Promise<Response> {
    try {
      console.log('[DocumentController] generateTranscript - Início');
      const { studentId } = req.params;

      if (!studentId) {
        console.log('[DocumentController] Erro: ID do aluno não fornecido');
        return res.status(400).json({ error: 'ID do aluno é obrigatório' });
      }

      // Buscar aluno
      console.log('[DocumentController] Buscando aluno:', studentId);
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });

      if (!student) {
        console.log('[DocumentController] Aluno não encontrado:', studentId);
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }
      console.log('[DocumentController] Aluno encontrado:', student.name);

      // Primeiro, tentar buscar do AcademicHistory
      console.log('[DocumentController] Buscando histórico acadêmico...');
      let academicHistory = await this.academicHistoryRepository.find({
        where: { studentId },
        order: { year: 'ASC', period: 'ASC' },
      });

      console.log('[DocumentController] Histórico acadêmico encontrado:', academicHistory.length, 'registros');

      // Se não houver histórico acadêmico, construir a partir das notas
      if (academicHistory.length === 0) {
        console.log('[DocumentController] Nenhum histórico encontrado. Tentando construir a partir das notas...');
        
        // Buscar matrículas em disciplinas com notas
        const disciplineEnrollments = await this.disciplineEnrollmentRepository
          .createQueryBuilder('de')
          .innerJoin('de.enrollment', 'enrollment')
          .innerJoin('de.discipline', 'discipline')
          .leftJoinAndSelect('de.grades', 'grade')
          .where('enrollment.studentId = :studentId', { studentId })
          .getMany();

        console.log('[DocumentController] Matrículas em disciplinas encontradas:', disciplineEnrollments.length);

        // Converter para formato de histórico acadêmico
        for (const de of disciplineEnrollments) {
          const grade = de.grades && de.grades.length > 0 ? de.grades[0] : null;
          
          // Determinar status com base na nota
          let status = AcademicHistoryStatus.IN_PROGRESS;
          if (grade) {
            if (grade.average !== null && grade.average !== undefined) {
              if (Number(grade.average) >= 7) {
                status = AcademicHistoryStatus.APPROVED;
              } else if (Number(grade.average) >= 5) {
                status = AcademicHistoryStatus.RECOVERY;
              } else {
                status = AcademicHistoryStatus.FAILED;
              }
            }
          }

          const historyEntry: Partial<AcademicHistory> = {
            studentId: studentId,
            disciplineId: de.disciplineId,
            discipline: de.discipline?.name || 'Disciplina',
            disciplineName: de.discipline?.name || 'Disciplina',
            courseName: '',
            year: de.year || new Date().getFullYear(),
            period: de.period || 1,
            grade: grade?.average ? Number(grade.average) : 0,
            status: status,
            workload: de.discipline?.workload || 60,
            attendancePercentage: grade?.attendancePercentage ? Number(grade.attendancePercentage) : 0,
          };
          
          academicHistory.push(historyEntry as AcademicHistory);
        }
        
        // Ordenar por ano e período
        academicHistory.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.period - b.period;
        });
      }

      // VERIFICAÇÃO FINAL: Se ainda não há dados, retornar erro
      if (academicHistory.length === 0) {
        console.log('[DocumentController] ERRO: Nenhum dado de histórico acadêmico encontrado para o aluno');
        return res.status(404).json({ 
          error: 'Nenhum histórico acadêmico encontrado para este aluno',
          details: 'O aluno não possui disciplinas cursadas ou notas lançadas no sistema'
        });
      }

      // Gerar código de verificação digital
      const verificationCode = uuidv4().substring(0, 8).toUpperCase();
      console.log('[DocumentController] Código de verificação:', verificationCode);
      console.log('[DocumentController] Gerando PDF com', academicHistory.length, 'disciplinas');

      // Gerar PDF
      const pdfBuffer = await generateTranscriptPDF(student, academicHistory, verificationCode);

      if (!pdfBuffer || pdfBuffer.length === 0) {
        console.error('[DocumentController] ERRO: PDF gerado está vazio');
        return res.status(500).json({ error: 'Erro ao gerar PDF: buffer vazio' });
      }

      console.log('[DocumentController] PDF gerado com sucesso, tamanho:', pdfBuffer.length, 'bytes');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=historico_${student.registrationNumber || studentId}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      return res.status(200).end(pdfBuffer);
    } catch (error: any) {
      console.error('[DocumentController] Erro ao gerar histórico escolar:', error);
      console.error('[DocumentController] Stack:', error.stack);
      return res.status(500).json({ 
        error: error.message || 'Erro ao gerar histórico escolar',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // RF#29 - Emissão de declaração de matrícula
  async generateEnrollmentCertificate(req: AuthRequest, res: Response): Promise<Response> {
    try {
      console.log('[DocumentController] generateEnrollmentCertificate - Início');
      const { studentId } = req.params;

      if (!studentId) {
        console.log('[DocumentController] Erro: ID do aluno não fornecido');
        return res.status(400).json({ error: 'ID do aluno é obrigatório' });
      }

      console.log('[DocumentController] Buscando aluno:', studentId);
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });

      if (!student) {
        console.log('[DocumentController] Aluno não encontrado:', studentId);
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }
      console.log('[DocumentController] Aluno:', student.name);

      // Buscar matrículas com relations
      console.log('[DocumentController] Buscando matrículas...');
      const enrollments = await this.enrollmentRepository.find({
        where: { studentId },
        relations: ['course'],
      });

      console.log('[DocumentController] Total de matrículas encontradas:', enrollments.length);
      
      // Encontrar matrícula ativa
      const activeEnrollment = enrollments.find((e) => {
        return e.status === EnrollmentStatus.ACTIVE;
      });

      console.log('[DocumentController] Matrícula ativa encontrada:', activeEnrollment ? 'Sim' : 'Não');

      // Se não houver matrícula ativa, retornar erro
      if (!activeEnrollment) {
        console.log('[DocumentController] ERRO: Nenhuma matrícula ativa encontrada');
        
        if (enrollments.length > 0) {
          // Tem matrículas mas nenhuma ativa
          return res.status(404).json({ 
            error: 'Aluno não possui matrícula ativa',
            details: 'O aluno possui matrículas no sistema, mas nenhuma está com status ativo'
          });
        }
        
        // Não tem nenhuma matrícula
        return res.status(404).json({ 
          error: 'Nenhuma matrícula encontrada para este aluno',
          details: 'O aluno não possui nenhuma matrícula cadastrada no sistema'
        });
      }

      // Preparar dados para o PDF
      const enrollmentData = {
        ...activeEnrollment,
        course: activeEnrollment.course || null,
      };

      console.log('[DocumentController] Dados da matrícula:', {
        course: enrollmentData.course?.name,
        period: enrollmentData.period,
        year: enrollmentData.year,
        status: enrollmentData.status
      });

      // Gerar código de verificação digital
      const verificationCode = uuidv4().substring(0, 8).toUpperCase();
      console.log('[DocumentController] Código de verificação:', verificationCode);

      // Gerar PDF
      const pdfBuffer = await this.generateCertificatePDF(
        student, 
        enrollmentData, 
        verificationCode,
        'DECLARAÇÃO DE MATRÍCULA'
      );

      if (!pdfBuffer || pdfBuffer.length === 0) {
        console.error('[DocumentController] ERRO: PDF gerado está vazio');
        return res.status(500).json({ error: 'Erro ao gerar PDF: buffer vazio' });
      }

      console.log('[DocumentController] PDF gerado com sucesso, tamanho:', pdfBuffer.length, 'bytes');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=declaracao_matricula_${student.registrationNumber || studentId}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      return res.status(200).end(pdfBuffer);
    } catch (error: any) {
      console.error('[DocumentController] Erro ao gerar declaração de matrícula:', error);
      console.error('[DocumentController] Stack:', error.stack);
      return res.status(500).json({ 
        error: error.message || 'Erro ao gerar declaração de matrícula',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // RF#30 - Emissão de boleto acadêmico
  async generateBoletim(req: AuthRequest, res: Response): Promise<Response> {
    try {
      console.log('[DocumentController] generateBoletim - Início');
      const { studentId, period } = req.params;
      const { year } = req.query;

      if (!studentId || !period) {
        console.log('[DocumentController] Erro: ID do aluno ou período não fornecido');
        return res.status(400).json({ error: 'ID do aluno e período são obrigatórios' });
      }

      console.log('[DocumentController] Buscando aluno:', studentId);
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });

      if (!student) {
        console.log('[DocumentController] Aluno não encontrado:', studentId);
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }
      console.log('[DocumentController] Aluno:', student.name);

      const periodNum = parseInt(period as string);
      const yearNum = parseInt(year as string) || new Date().getFullYear();

      console.log('[DocumentController] Buscando disciplinas do período:', periodNum, '/', yearNum);

      // Buscar disciplinas do período com notas
      const disciplineEnrollments = await this.disciplineEnrollmentRepository
        .createQueryBuilder('de')
        .innerJoin('de.enrollment', 'enrollment')
        .innerJoin('de.discipline', 'discipline')
        .leftJoinAndSelect('de.grades', 'grade')
        .where('enrollment.studentId = :studentId', { studentId })
        .andWhere('de.period = :period', { period: periodNum })
        .andWhere('de.year = :year', { year: yearNum })
        .getMany();

      console.log('[DocumentController] Disciplinas encontradas:', disciplineEnrollments.length);

      // Se não houver disciplinas, retornar erro
      if (disciplineEnrollments.length === 0) {
        console.log('[DocumentController] ERRO: Nenhuma disciplina encontrada para este período');
        return res.status(404).json({ 
          error: 'Nenhuma disciplina encontrada para este período',
          details: `O aluno não possui disciplinas cursadas no ${periodNum}º período de ${yearNum}`
        });
      }

      // Log das disciplinas encontradas
      for (const de of disciplineEnrollments) {
        const grade = de.grades && de.grades.length > 0 ? de.grades[0] : null;
        console.log('[DocumentController] Disciplina:', de.discipline?.name, '| Nota:', grade?.average, '| Status:', grade?.finalStatus);
      }

      // Gerar código de verificação digital
      const verificationCode = uuidv4().substring(0, 8).toUpperCase();
      console.log('[DocumentController] Código de verificação:', verificationCode);

      // Gerar PDF
      const pdfBuffer = await this.generateBoletimPDF(
        student, 
        disciplineEnrollments, 
        periodNum,
        yearNum,
        verificationCode
      );

      if (!pdfBuffer || pdfBuffer.length === 0) {
        console.error('[DocumentController] ERRO: PDF gerado está vazio');
        return res.status(500).json({ error: 'Erro ao gerar PDF: buffer vazio' });
      }

      console.log('[DocumentController] PDF gerado com sucesso, tamanho:', pdfBuffer.length, 'bytes');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=boletim_${student.registrationNumber || studentId}_${periodNum}${yearNum}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      return res.status(200).end(pdfBuffer);
    } catch (error: any) {
      console.error('[DocumentController] Erro ao gerar boleto acadêmico:', error);
      console.error('[DocumentController] Stack:', error.stack);
      return res.status(500).json({ 
        error: error.message || 'Erro ao gerar boleto acadêmico',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // RF#31 - Emissão de certificados e declarações
  async generateCertificate(req: AuthRequest, res: Response): Promise<Response> {
    try {
      console.log('[DocumentController] generateCertificate - Início');
      const { studentId } = req.params;
      const { type = 'completion' } = req.query;

      if (!studentId) {
        console.log('[DocumentController] Erro: ID do aluno não fornecido');
        return res.status(400).json({ error: 'ID do aluno é obrigatório' });
      }

      console.log('[DocumentController] Buscando aluno:', studentId);
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });

      if (!student) {
        console.log('[DocumentController] Aluno não encontrado:', studentId);
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }
      console.log('[DocumentController] Aluno:', student.name);

      // Buscar matrículas do aluno
      console.log('[DocumentController] Buscando matrículas...');
      const enrollments = await this.enrollmentRepository.find({
        where: { studentId },
        relations: ['course'],
      });

      console.log('[DocumentController] Total de matrículas:', enrollments.length);

      // Encontrar matrícula ativa
      const activeEnrollment = enrollments.find((e) => 
        e.status === EnrollmentStatus.ACTIVE
      );

      console.log('[DocumentController] Matrícula ativa:', activeEnrollment ? 'Encontrada' : 'Não encontrada');

      // Se não houver matrícula ativa, retornar erro
      if (!activeEnrollment) {
        if (enrollments.length > 0) {
          return res.status(404).json({ 
            error: 'Aluno não possui matrícula ativa',
            details: 'O aluno possui matrículas no sistema, mas nenhuma está com status ativo'
          });
        }
        return res.status(404).json({ 
          error: 'Nenhuma matrícula encontrada para este aluno',
          details: 'O aluno não possui nenhuma matrícula cadastrada no sistema'
        });
      }
      
      // Buscar histórico para verificar conclusão
      console.log('[DocumentController] Buscando histórico acadêmico...');
      const academicHistory = await this.academicHistoryRepository.find({
        where: { studentId },
      });

      console.log('[DocumentController] Histórico encontrado:', academicHistory.length, 'registros');

      // Contar disciplinas aprovadas
      const completedDisciplines = academicHistory.filter((h) => {
        return h.status === AcademicHistoryStatus.APPROVED;
      });

      console.log('[DocumentController] Disciplinas aprovadas:', completedDisciplines.length);

      // Se não houver disciplinas aprovadas, retornar erro
      if (completedDisciplines.length === 0) {
        console.log('[DocumentController] ERRO: Nenhuma disciplina aprovada encontrada');
        return res.status(404).json({ 
          error: 'Nenhuma disciplina aprovada encontrada',
          details: 'O aluno não possui disciplinas aprovadas para emissão de certificado'
        });
      }

      // Gerar código de verificação digital
      const verificationCode = uuidv4().substring(0, 8).toUpperCase();
      console.log('[DocumentController] Código de verificação:', verificationCode);

      let certificateType = 'CERTIFICADO DE CONCLUSÃO';
      if (type === 'participation') {
        certificateType = 'CERTIFICADO DE PARTICIPAÇÃO';
      }

      console.log('[DocumentController] Tipo de certificado:', certificateType);

      // Preparar dados do enrollment
      const enrollmentData = {
        ...activeEnrollment,
        course: activeEnrollment.course || null,
      };

      // Gerar PDF
      const pdfBuffer = await this.generateCertificatePDF(
        student,
        enrollmentData,
        verificationCode,
        certificateType,
        true
      );

      if (!pdfBuffer || pdfBuffer.length === 0) {
        console.error('[DocumentController] ERRO: PDF gerado está vazio');
        return res.status(500).json({ error: 'Erro ao gerar PDF: buffer vazio' });
      }

      console.log('[DocumentController] PDF gerado com sucesso, tamanho:', pdfBuffer.length, 'bytes');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=certificado_${student.registrationNumber || studentId}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      return res.status(200).end(pdfBuffer);
    } catch (error: any) {
      console.error('[DocumentController] Erro ao gerar certificado:', error);
      console.error('[DocumentController] Stack:', error.stack);
      return res.status(500).json({ 
        error: error.message || 'Erro ao gerar certificado',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Métodos auxiliares para gerar PDFs
  private async generateCertificatePDF(
    student: Student,
    enrollment: any,
    verificationCode: string,
    title: string,
    hasCompleted?: boolean
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
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
        doc.text(`Nome do Aluno: ${student.name || 'N/A'}`);
        doc.text(`CPF: ${student.cpf || 'N/A'}`);
        doc.text(`Matrícula: ${student.registrationNumber || 'N/A'}`);
        
        if (enrollment && enrollment.course) {
          const courseName = enrollment.course.name || 'N/A';
          const period = enrollment.period || 'N/A';
          const year = enrollment.year || 'N/A';
          
          doc.text(`Curso: ${courseName}`);
          doc.text(`Período: ${period}º Semestre / ${year}`);
        }

        if (hasCompleted !== undefined) {
          doc.moveDown();
          doc.text(`Status: ${hasCompleted ? 'CONCLUÍDO' : 'EM ANDAMENTO'}`);
        }

        doc.moveDown();
        doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`);
        doc.moveDown(2);

        // Texto adicional para certificado
        if (title.includes('CONCLUSÃO')) {
          doc.text('Certificamos que o aluno acima mencionado concluiu o curso com êxito,', { align: 'center' });
          doc.text('tendo completado todas as disciplinas obrigatórias.', { align: 'center' });
          doc.moveDown();
        }

        // Código de verificação
        doc.fontSize(10).font('Helvetica-Oblique');
        doc.text(`Código de Verificação: ${verificationCode}`, { align: 'center' });
        
        doc.moveDown();
        doc.text(
          'Este documento pode ser verificado no site oficial da instituição.',
          { align: 'center' }
        );

        // Assinaturas
        doc.moveDown(3);
        doc.fontSize(10).font('Helvetica');
        doc.text('_'.repeat(40), 50, doc.y, { align: 'center' });
        doc.text('Secretário Acadêmico', { align: 'center' });
        doc.moveDown();
        doc.text('_'.repeat(40), 50, doc.y, { align: 'center' });
        doc.text('Coordenador do Curso', { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async generateBoletimPDF(
    student: Student,
    disciplineEnrollments: any[],
    period: number,
    year: number,
    verificationCode: string
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Cabeçalho
        doc.fontSize(18).font('Helvetica-Bold').text('INSTITUIÇÃO DE ENSINO', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).font('Helvetica').text('BOLETIM ACADÊMICO', { align: 'center' });
        doc.moveDown(2);

        // Dados do aluno
        doc.fontSize(12).font('Helvetica');
        doc.text(`Nome: ${student.name || 'N/A'}`);
        doc.text(`Matrícula: ${student.registrationNumber || 'N/A'}`);
        doc.text(`Período: ${period || 'N/A'}º Semestre / ${year || 'N/A'}`);
        doc.moveDown(2);

        // Tabela de disciplinas
        doc.fontSize(10).font('Helvetica-Bold');
        const tableTop = doc.y;
        doc.text('Disciplina', 50, tableTop, { continued: true, width: 200 });
        doc.text('Nota 1', 250, tableTop, { continued: true, width: 60 });
        doc.text('Nota 2', 310, tableTop, { continued: true, width: 60 });
        doc.text('Média', 370, tableTop, { continued: true, width: 60 });
        doc.text('Frequência', 430, tableTop, { width: 80 });
        doc.moveDown();

        doc.font('Helvetica').fontSize(10);
        
        let currentY = doc.y;
        
        if (!disciplineEnrollments || disciplineEnrollments.length === 0) {
          doc.text('Nenhuma disciplina encontrada para este período.');
        } else {
          for (const de of disciplineEnrollments) {
            const grade = de.grades && de.grades.length > 0 ? de.grades[0] : null;
            const disciplineName = de.discipline?.name || 'Disciplina';
            
            currentY = doc.y;
            doc.text(disciplineName.substring(0, 30), 50, currentY, { continued: true, width: 200 });
            doc.text(grade?.grade1?.toFixed(1) || '-', 250, currentY, { continued: true, width: 60 });
            doc.text(grade?.grade2?.toFixed(1) || '-', 310, currentY, { continued: true, width: 60 });
            doc.text(grade?.average?.toFixed(1) || '-', 370, currentY, { continued: true, width: 60 });
            doc.text(`${grade?.attendancePercentage?.toFixed(0) || 0}%`, 430, currentY, { width: 80 });
            doc.moveDown();
          }
        }

        doc.moveDown(2);

        // Resumo do período
        const totalDisciplinas = disciplineEnrollments?.length || 0;
        let totalNotas = 0;
        let somaMedias = 0;
        
        for (const de of disciplineEnrollments || []) {
          const grade = de.grades && de.grades.length > 0 ? de.grades[0] : null;
          if (grade?.average) {
            somaMedias += Number(grade.average);
            totalNotas++;
          }
        }
        
        const mediaGeral = totalNotas > 0 ? (somaMedias / totalNotas).toFixed(2) : '-';

        doc.fontSize(10).font('Helvetica');
        doc.text(`Total de Disciplinas: ${totalDisciplinas}`);
        doc.text(`Média Geral do Período: ${mediaGeral}`);
        doc.moveDown(2);

        // Código de verificação
        doc.fontSize(10).font('Helvetica-Oblique');
        doc.text(`Código de Verificação: ${verificationCode}`, { align: 'center' });

        // Assinaturas
        doc.moveDown(3);
        doc.fontSize(10).font('Helvetica');
        doc.text('_'.repeat(40), 50, doc.y, { align: 'center' });
        doc.text('Secretário Acadêmico', { align: 'center' });
        doc.moveDown();
        doc.text('_'.repeat(40), 50, doc.y, { align: 'center' });
        doc.text('Coordenador do Curso', { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

