
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Grade, GradeStatus } from '../entities/Grade';
import { DisciplineEnrollment } from '../entities/DisciplineEnrollment';
import { AcademicHistory, AcademicHistoryStatus } from '../entities/AcademicHistory';
import { AuthRequest } from '../middleware/auth';

// Constantes para cálculo de médias
const MIN_GRADE_APPROVAL = 7.0; // Nota mínima para aprovação
const MIN_ATTENDANCE = 75.0; // Percentual mínimo de frequência
const RECOVERY_GRADE = 5.0; // Nota mínima para recuperação

export class GradeController {
  // RF#23 - Lançamento de notas
  async createOrUpdate(req: AuthRequest, res: Response): Promise<Response> {
    const gradeRepository = AppDataSource.getRepository(Grade);
    const disciplineEnrollmentRepository = AppDataSource.getRepository(DisciplineEnrollment);
    const academicHistoryRepository = AppDataSource.getRepository(AcademicHistory);
    
    try {
      const { disciplineEnrollmentId, grade1, grade2, grade3 } = req.body;

      // Validar campos obrigatórios
      if (!disciplineEnrollmentId) {
        return res.status(400).json({ error: 'ID da matrícula na disciplina é obrigatório' });
      }

      const disciplineEnrollment = await disciplineEnrollmentRepository.findOne({
        where: { id: disciplineEnrollmentId },
        relations: ['enrollment', 'discipline'],
      });

      if (!disciplineEnrollment) {
        return res.status(404).json({ error: 'Matrícula na disciplina não encontrada' });
      }

      // Verificar se já existe lançamento de notas
      let grade = await gradeRepository.findOne({
        where: { disciplineEnrollmentId },
      });

      if (grade) {
        // Atualizar notas existentes
        if (grade1 !== undefined) grade.grade1 = grade1;
        if (grade2 !== undefined) grade.grade2 = grade2;
        if (grade3 !== undefined) grade.grade3 = grade3;
      } else {
        // Criar novo registro de notas
        grade = gradeRepository.create({
          disciplineEnrollmentId,
          grade1,
          grade2,
          grade3,
          totalClasses: 60,
          attendedClasses: 60,
          attendance: 60,
          attendancePercentage: 100,
        });
      }

      // RF#25 - Calcular média automaticamente (com verificação defensiva)
      const avg = GradeController.computeAverage(grade.grade1, grade.grade2, grade.grade3);
      grade.average = avg;

      // RF#26 - Determinar situação do aluno
      grade.finalStatus = GradeController.computeStatus(grade.average, grade.attendancePercentage) as any;

      const savedGrade = await gradeRepository.save(grade);

      // Atualizar histórico acadêmico - usando referência estática para garantir contexto
      await GradeController.updateAcademicHistoryStatic(
        disciplineEnrollment, 
        savedGrade, 
        academicHistoryRepository
      );

      return res.json(savedGrade);
    } catch (error: any) {
      console.error('Erro ao lançar notas:', error);
      return res.status(500).json({ error: error.message || 'Erro ao lançar notas' });
    }
  }

  // RF#24 - Registro de frequência
  async updateAttendance(req: AuthRequest, res: Response): Promise<Response> {
    const gradeRepository = AppDataSource.getRepository(Grade);
    const disciplineEnrollmentRepository = AppDataSource.getRepository(DisciplineEnrollment);
    const academicHistoryRepository = AppDataSource.getRepository(AcademicHistory);
    
    try {
      const { disciplineEnrollmentId } = req.params;
      const { totalClasses, attendedClasses } = req.body;

      // Validar campos obrigatórios
      if (!disciplineEnrollmentId) {
        return res.status(400).json({ error: 'ID da matrícula na disciplina é obrigatório' });
      }

      const grade = await gradeRepository.findOne({
        where: { disciplineEnrollmentId },
      });

      if (!grade) {
        return res.status(404).json({ error: 'Registro de notas não encontrado' });
      }

      grade.totalClasses = totalClasses || grade.totalClasses;
      grade.attendedClasses = attendedClasses || grade.attendedClasses;
      // Arredondar para 2 casas decimais
      grade.attendancePercentage = Math.round((grade.attendedClasses / grade.totalClasses) * 10000) / 100;
      grade.lastAttendanceUpdate = new Date();

      // Recalcular situação após atualização de frequência
      grade.finalStatus = GradeController.computeStatus(grade.average, grade.attendancePercentage) as any;

      const savedGrade = await gradeRepository.save(grade);

      // Atualizar histórico acadêmico
      const disciplineEnrollment = await disciplineEnrollmentRepository.findOne({
        where: { id: disciplineEnrollmentId },
        relations: ['enrollment', 'discipline'],
      });
      
      if (disciplineEnrollment) {
        await GradeController.updateAcademicHistoryStatic(
          disciplineEnrollment, 
          savedGrade, 
          academicHistoryRepository
        );
      }

      return res.json(savedGrade);
    } catch (error: any) {
      console.error('Erro ao atualizar frequência:', error);
      return res.status(500).json({ error: error.message || 'Erro ao atualizar frequência' });
    }
  }

  // RF#25 - Cálculo automático da média final
  async getAverage(req: AuthRequest, res: Response): Promise<Response> {
    const gradeRepository = AppDataSource.getRepository(Grade);
    
    try {
      const { disciplineEnrollmentId } = req.params;

      const grade = await gradeRepository.findOne({
        where: { disciplineEnrollmentId },
      });

      if (!grade) {
        return res.status(404).json({ error: 'Registro de notas não encontrado' });
      }

      const average = GradeController.computeAverage(grade.grade1, grade.grade2, grade.grade3);

      return res.json({
        disciplineEnrollmentId,
        grade1: grade.grade1,
        grade2: grade.grade2,
        grade3: grade.grade3,
        average,
      });
    } catch (error: any) {
      console.error('Erro ao calcular média:', error);
      return res.status(500).json({ error: error.message || 'Erro ao calcular média' });
    }
  }

  // RF#26 - Indicação da situação do aluno
  async getStudentStatus(req: AuthRequest, res: Response): Promise<Response> {
    const gradeRepository = AppDataSource.getRepository(Grade);
    
    try {
      const { disciplineEnrollmentId } = req.params;

      const grade = await gradeRepository.findOne({
        where: { disciplineEnrollmentId },
        relations: ['disciplineEnrollment', 'disciplineEnrollment.discipline'],
      });

      if (!grade) {
        return res.status(404).json({ error: 'Registro de notas não encontrado' });
      }

      return res.json({
        disciplineEnrollmentId,
        average: grade.average,
        attendancePercentage: grade.attendancePercentage,
        status: grade.finalStatus,
        grade1: grade.grade1,
        grade2: grade.grade2,
        grade3: grade.grade3,
      });
    } catch (error: any) {
      console.error('Erro ao buscar situação do aluno:', error);
      return res.status(500).json({ error: error.message || 'Erro ao buscar situação do aluno' });
    }
  }

  async findByDiscipline(req: AuthRequest, res: Response): Promise<Response> {
    const disciplineEnrollmentRepository = AppDataSource.getRepository(DisciplineEnrollment);
    
    try {
      const { disciplineId } = req.params;

      const disciplineEnrollments = await disciplineEnrollmentRepository.find({
        where: { disciplineId },
        relations: ['grades', 'enrollment', 'enrollment.student'],
      });

      const grades = disciplineEnrollments.map((de: any) => ({
        ...de.grades,
        student: de.enrollment.student,
      }));

      return res.json(grades);
    } catch (error: any) {
      console.error('Erro ao buscar notas da disciplina:', error);
      return res.status(500).json({ error: error.message || 'Erro ao buscar notas da disciplina' });
    }
  }

  async findByStudent(req: AuthRequest, res: Response): Promise<Response> {
    const disciplineEnrollmentRepository = AppDataSource.getRepository(DisciplineEnrollment);
    
    try {
      const { studentId } = req.params;

      const disciplineEnrollments = await disciplineEnrollmentRepository
        .createQueryBuilder('de')
        .innerJoin('de.enrollment', 'enrollment')
        .innerJoin('de.grades', 'grade')
        .where('enrollment.studentId = :studentId', { studentId })
        .leftJoinAndSelect('de.discipline', 'discipline')
        .leftJoinAndSelect('de.grades', 'grade')
        .getMany();

      return res.json(disciplineEnrollments);
    } catch (error: any) {
      console.error('Erro ao buscar notas do aluno:', error);
      return res.status(500).json({ error: error.message || 'Erro ao buscar notas do aluno' });
    }
  }

  // Métodos auxiliares (públicos e estáticos para uso em toda a classe)
  static computeAverage(grade1?: number, grade2?: number, grade3?: number): number {
    const grades = [grade1, grade2, grade3].filter(g => g !== undefined && g !== null) as number[];
    
    if (grades.length === 0) return 0;

    const sum = grades.reduce((acc, g) => acc + g, 0);
    // Arredondar para 2 casas decimais
    return Math.round((sum / grades.length) * 100) / 100;
  }

  static computeStatus(average?: number, attendance?: number): string {
    if (average === undefined || attendance === undefined) {
      return 'in_progress';
    }

    if (attendance < MIN_ATTENDANCE) {
      return 'failed'; // Reprovado por falta
    }

    if (average >= MIN_GRADE_APPROVAL) {
      return 'approved'; // Aprovado
    }

    if (average >= RECOVERY_GRADE) {
      return 'recovery'; // Em recuperação
    }

    return 'failed'; // Reprovado por nota
  }

  private static async updateAcademicHistoryStatic(
    disciplineEnrollment: DisciplineEnrollment,
    grade: Grade,
    academicHistoryRepository: any
  ): Promise<void> {
    try {
      // Verificar se enrollment está carregado
      if (!disciplineEnrollment.enrollment) {
        console.warn('Enrollment não carregado na disciplina enrollment');
        return;
      }

      // Verificar se discipline está carregado
      if (!disciplineEnrollment.discipline) {
        console.warn('Discipline não carregado na disciplina enrollment');
        return;
      }

      const history = await academicHistoryRepository.findOne({
        where: {
          studentId: disciplineEnrollment.enrollment.studentId,
          disciplineId: disciplineEnrollment.disciplineId,
          year: disciplineEnrollment.year,
          period: disciplineEnrollment.period,
        },
      });

      if (history) {
        history.grade = grade.average;
        history.attendancePercentage = Math.round(grade.attendancePercentage || 0);
        history.status = GradeController.mapStatusStatic(grade.finalStatus as string);
        
        if (grade.finalStatus === 'approved' || grade.finalStatus === 'failed') {
          history.completionDate = new Date();
        }

        await academicHistoryRepository.save(history);
      }
    } catch (error) {
      console.error('Erro ao atualizar histórico acadêmico:', error);
    }
  }

  private static mapStatusStatic(status: string): AcademicHistoryStatus {
    switch (status) {
      case 'approved': return AcademicHistoryStatus.APPROVED;
      case 'failed': return AcademicHistoryStatus.FAILED;
      case 'recovery': return AcademicHistoryStatus.RECOVERY;
      case 'cancelled': return AcademicHistoryStatus.CANCELLED;
      default: return AcademicHistoryStatus.IN_PROGRESS;
    }
  }
}


