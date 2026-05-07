
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Enrollment, EnrollmentStatus } from '../entities/Enrollment';
import { DisciplineEnrollment, DisciplineEnrollmentStatus } from '../entities/DisciplineEnrollment';
import { Student, StudentStatus } from '../entities/Student';
import { Course } from '../entities/Course';
import { Discipline } from '../entities/Discipline';
import { AcademicHistory, AcademicHistoryStatus } from '../entities/AcademicHistory';
import { AuthRequest } from '../middleware/auth';

export class EnrollmentController {
  // RF#18 - Matrícula em cursos
  enrollInCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const studentRepository = AppDataSource.getRepository(Student);
    const courseRepository = AppDataSource.getRepository(Course);
    
    try {
      const { studentId, courseId, year, period } = req.body;

      // Validar campos obrigatórios
      if (!studentId) {
        return res.status(400).json({ error: 'ID do aluno é obrigatório' });
      }
      if (!courseId) {
        return res.status(400).json({ error: 'ID do curso é obrigatório' });
      }

      const student = await studentRepository.findOne({ where: { id: studentId } });
      if (!student) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }
      
      // Verificar status do aluno - converter para string para comparação
      const studentStatusStr = String(student.status);
      if (studentStatusStr !== 'active' && studentStatusStr !== 'ACTIVE') {
        return res.status(400).json({ error: 'Aluno não está ativo' });
      }

      const course = await courseRepository.findOne({ where: { id: courseId } });
      if (!course) {
        return res.status(404).json({ error: 'Curso não encontrado' });
      }

      // Verificar se já existe matrícula ativa para este aluno neste curso
      const existingEnrollment = await enrollmentRepository.findOne({
        where: { 
          studentId,
          courseId,
          status: EnrollmentStatus.ACTIVE,
        },
      });
      
      if (existingEnrollment) {
        return res.status(400).json({ error: 'Aluno já possui matrícula ativa neste curso' });
      }

      const enrollment = enrollmentRepository.create({
        studentId,
        courseId,
        year: year || new Date().getFullYear(),
        period: period || (new Date().getMonth() < 6 ? 1 : 2),
        status: EnrollmentStatus.ACTIVE,
      });

      const savedEnrollment = await enrollmentRepository.save(enrollment);
      return res.status(201).json(savedEnrollment);
    } catch (error: any) {
      console.error('Erro ao criar matrícula:', error);
      return res.status(500).json({ error: error.message || 'Erro ao criar matrícula' });
    }
  }

  // RF#19 - Matrícula em disciplinas por período letivo
  enrollInDiscipline = async (req: AuthRequest, res: Response): Promise<Response> => {
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const disciplineEnrollmentRepository = AppDataSource.getRepository(DisciplineEnrollment);
    const studentRepository = AppDataSource.getRepository(Student);
    const courseRepository = AppDataSource.getRepository(Course);
    const disciplineRepository = AppDataSource.getRepository(Discipline);
    const academicHistoryRepository = AppDataSource.getRepository(AcademicHistory);
    
    try {
      const { id } = req.params;
      const { disciplineIds, year, period } = req.body;

      const enrollment = await enrollmentRepository.findOne({ 
        where: { id },
        relations: ['student']
      });
      
      if (!enrollment) {
        return res.status(404).json({ error: 'Matrícula não encontrada' });
      }

      const enrolledDisciplines = [];
      const errors = [];

      for (const disciplineId of disciplineIds) {
        const discipline = await disciplineRepository.findOne({ 
          where: { id: disciplineId },
          relations: ['course']
        });
        
        if (!discipline) {
          errors.push(`Disciplina ${disciplineId} não encontrada`);
          continue;
        }

        // Verificar pré-requisitos
        if (discipline.prerequisiteIds && discipline.prerequisiteIds.length > 0) {
          const completedHistory = await academicHistoryRepository.find({
            where: {
              studentId: enrollment.studentId,
              status: AcademicHistoryStatus.APPROVED,
            },
          });

          const completedDisciplineIds = completedHistory.map(h => h.disciplineId);
          const missingPrerequisites = discipline.prerequisiteIds.filter(
            pid => !completedDisciplineIds.includes(pid)
          );

          if (missingPrerequisites.length > 0) {
            errors.push(`Disciplina ${discipline.name}: Pré-requisitos não atendidos`);
            continue;
          }
        }

        // Verificar se já está matriculado
        const existingEnrollment = await disciplineEnrollmentRepository.findOne({
          where: {
            enrollmentId: id,
            disciplineId,
          },
        });

        if (existingEnrollment) {
          errors.push(`Disciplina ${discipline.name}: Já matriculado`);
          continue;
        }

        const disciplineEnrollment = disciplineEnrollmentRepository.create({
          enrollmentId: id,
          disciplineId,
          year: year || new Date().getFullYear(),
          period: period || (new Date().getMonth() < 6 ? 1 : 2),
          status: DisciplineEnrollmentStatus.ACTIVE,
        });

        const savedDisciplineEnrollment = await disciplineEnrollmentRepository.save(disciplineEnrollment);
        enrolledDisciplines.push(savedDisciplineEnrollment);

        const course = await courseRepository.findOne({ where: { id: enrollment.courseId } });
        
        const academicHistory = academicHistoryRepository.create({
          studentId: enrollment.studentId,
          disciplineId,
          disciplineName: discipline.name,
          courseName: course?.name || '',
          year: disciplineEnrollment.year!,
          period: disciplineEnrollment.period!,
          status: AcademicHistoryStatus.IN_PROGRESS,
          workload: discipline.workload,
        });
        await academicHistoryRepository.save(academicHistory);
      }

      return res.status(201).json({
        message: errors.length > 0 ? 'Algumas disciplinas não foram matriculadas' : 'Matrícula em disciplinas realizada com sucesso',
        enrolledDisciplines,
        errors,
      });
    } catch (error: any) {
      console.error('Erro ao matricular em disciplinas:', error);
      return res.status(500).json({ error: error.message || 'Erro ao matricular em disciplinas' });
    }
  }

  // RF#21 - Cancelamento de matrícula em disciplinas
  cancelDisciplineEnrollment = async (req: AuthRequest, res: Response): Promise<Response> => {
    const disciplineEnrollmentRepository = AppDataSource.getRepository(DisciplineEnrollment);
    const academicHistoryRepository = AppDataSource.getRepository(AcademicHistory);
    
    try {
      const { id, disciplineId } = req.params;
      const { reason } = req.body;

      const disciplineEnrollment = await disciplineEnrollmentRepository.findOne({
        where: {
          enrollmentId: id,
          disciplineId,
        },
        relations: ['enrollment']
      });

      if (!disciplineEnrollment) {
        return res.status(404).json({ error: 'Matrícula na disciplina não encontrada' });
      }

      disciplineEnrollment.status = DisciplineEnrollmentStatus.CANCELLED;
      disciplineEnrollment.cancellationDate = new Date();
      disciplineEnrollment.cancellationReason = reason || 'Cancelamento solicitado pelo aluno';

      const updatedDisciplineEnrollment = await disciplineEnrollmentRepository.save(disciplineEnrollment);

      const historyEntry = await academicHistoryRepository.findOne({
        where: {
          studentId: disciplineEnrollment.enrollment.studentId,
          disciplineId: disciplineId,
        },
      });
      
      if (historyEntry) {
        await academicHistoryRepository.update(
          { id: historyEntry.id },
          { status: AcademicHistoryStatus.CANCELLED }
        );
      }

      return res.json({
        message: 'Matrícula na disciplina cancelada com sucesso',
        disciplineEnrollment: updatedDisciplineEnrollment,
      });
    } catch (error: any) {
      console.error('Erro ao cancelar matrícula na disciplina:', error);
      return res.status(500).json({ error: error.message || 'Erro ao cancelar matrícula na disciplina' });
    }
  }

  // RF#22 - Registro de histórico de matrículas
  getEnrollmentHistory = async (req: AuthRequest, res: Response): Promise<Response> => {
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    
    try {
      const { id } = req.params;

      const enrollment = await enrollmentRepository.findOne({
        where: { id },
        relations: ['disciplineEnrollments', 'disciplineEnrollments.discipline', 'disciplineEnrollments.grades'],
      });

      if (!enrollment) {
        return res.status(404).json({ error: 'Matrícula não encontrada' });
      }

      return res.json(enrollment);
    } catch (error: any) {
      console.error('Erro ao buscar histórico de matrículas:', error);
      return res.status(500).json({ error: error.message || 'Erro ao buscar histórico de matrículas' });
    }
  }

  getStudentEnrollments = async (req: AuthRequest, res: Response): Promise<Response> => {
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    
    try {
      const { studentId } = req.params;

      const enrollments = await enrollmentRepository.find({
        where: { studentId },
        relations: ['course', 'disciplineEnrollments', 'disciplineEnrollments.discipline', 'disciplineEnrollments.grades'],
      });

      return res.json(enrollments);
    } catch (error: any) {
      console.error('Erro ao buscar matrículas do aluno:', error);
      return res.status(500).json({ error: error.message || 'Erro ao buscar matrículas do aluno' });
    }
  }

  findAll = async (req: AuthRequest, res: Response): Promise<Response> => {
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    
    try {
      const { studentId, courseId, year, period, status } = req.query;

      const query = enrollmentRepository.createQueryBuilder('enrollment')
        .leftJoinAndSelect('enrollment.student', 'student')
        .leftJoinAndSelect('enrollment.course', 'course')
        .leftJoinAndSelect('enrollment.disciplineEnrollments', 'disciplineEnrollments')
        .leftJoinAndSelect('disciplineEnrollments.discipline', 'discipline')
        .leftJoinAndSelect('disciplineEnrollments.grades', 'grades');

      if (studentId) {
        query.andWhere('enrollment.studentId = :studentId', { studentId });
      }
      if (courseId) {
        query.andWhere('enrollment.courseId = :courseId', { courseId });
      }
      if (year) {
        query.andWhere('enrollment.year = :year', { year });
      }
      if (period) {
        query.andWhere('enrollment.period = :period', { period });
      }
      if (status) {
        query.andWhere('enrollment.status = :status', { status });
      }

      const enrollments = await query.getMany();
      return res.json(enrollments);
    } catch (error: any) {
      console.error('Erro ao buscar matrículas:', error);
      return res.status(500).json({ error: error.message || 'Erro ao buscar matrículas' });
    }
  }

  // Novo endpoint para buscar todos os disciplineEnrollments disponíveis para lançamento de notas
  getAllDisciplineEnrollments = async (req: AuthRequest, res: Response): Promise<Response> => {
    const disciplineEnrollmentRepository = AppDataSource.getRepository(DisciplineEnrollment);
    
    try {
      const { year, period, disciplineId, teacherId } = req.query;

      const query = disciplineEnrollmentRepository.createQueryBuilder('de')
        .leftJoinAndSelect('de.enrollment', 'enrollment')
        .leftJoinAndSelect('enrollment.student', 'student')
        .leftJoinAndSelect('enrollment.course', 'course')
        .leftJoinAndSelect('de.discipline', 'discipline')
        .leftJoinAndSelect('de.teacher', 'teacher')
        .leftJoinAndSelect('de.grades', 'grades')
        .where('de.status = :status', { status: 'active' });

      if (year) {
        query.andWhere('de.year = :year', { year: parseInt(year as string) });
      }
      if (period) {
        query.andWhere('de.period = :period', { period: parseInt(period as string) });
      }
      if (disciplineId) {
        query.andWhere('de.disciplineId = :disciplineId', { disciplineId });
      }
      if (teacherId) {
        query.andWhere('de.teacherId = :teacherId', { teacherId });
      }

      const disciplineEnrollments = await query.getMany();

      // Formatar dados para exibir no frontend
      // Converter explicitamente valores decimais para números (TypeORM retorna decimal como string)
      const formattedData = disciplineEnrollments.map((de: any) => ({
        id: de.id,
        studentId: de.enrollment?.student?.id,
        studentName: de.enrollment?.student?.name || 'Aluno',
        studentRegistration: de.enrollment?.student?.registrationNumber || '',
        disciplineId: de.discipline?.id,
        disciplineName: de.discipline?.name || 'Disciplina',
        teacherId: de.teacher?.id,
        teacherName: de.teacher?.name || 'Professor',
        courseId: de.enrollment?.course?.id,
        courseName: de.enrollment?.course?.name || 'Curso',
        year: de.year,
        period: de.period,
        // Converter explicitamente para número para evitar erro no frontend
        grade1: de.grades?.[0]?.grade1 != null ? Number(de.grades?.[0]?.grade1) : null,
        grade2: de.grades?.[0]?.grade2 != null ? Number(de.grades?.[0]?.grade2) : null,
        grade3: de.grades?.[0]?.grade3 != null ? Number(de.grades?.[0]?.grade3) : null,
        average: de.grades?.[0]?.average != null ? Number(de.grades?.[0]?.average) : null,
        attendancePercentage: de.grades?.[0]?.attendancePercentage != null ? Number(de.grades?.[0]?.attendancePercentage) : null,
        // Return 'in_progress' as default when no grades exist yet
        finalStatus: de.grades?.[0]?.finalStatus || 'in_progress',
      }));

      return res.json(formattedData);
    } catch (error: any) {
      console.error('Erro ao buscar matrículas nas disciplinas:', error);
      return res.status(500).json({ error: error.message || 'Erro ao buscar matrículas nas disciplinas' });
    }
  }
}


