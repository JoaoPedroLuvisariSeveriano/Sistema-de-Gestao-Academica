import { Router, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Student, StudentStatus } from '../entities/Student';
import { Teacher, TeacherStatus } from '../entities/Teacher';
import { Course, CourseStatus, CourseModality, CourseType } from '../entities/Course';
import { Discipline, DisciplineStatus } from '../entities/Discipline';
import { Enrollment } from '../entities/Enrollment';
import { Grade } from '../entities/Grade';

const router = Router();

// Debug: List all entities counts
router.get('/debug/db-status', async (req: any, res: Response) => {
  try {
    const studentCount = await AppDataSource.getRepository(Student).count();
    const teacherCount = await AppDataSource.getRepository(Teacher).count();
    const courseCount = await AppDataSource.getRepository(Course).count();
    const disciplineCount = await AppDataSource.getRepository(Discipline).count();
    const enrollmentCount = await AppDataSource.getRepository(Enrollment).count();
    const gradeCount = await AppDataSource.getRepository(Grade).count();
    
    res.json({
      students: studentCount,
      teachers: teacherCount,
      courses: courseCount,
      disciplines: disciplineCount,
      enrollments: enrollmentCount,
      grades: gradeCount
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Erro ao buscar status do banco' });
  }
});

// Debug: Create sample data
router.post('/debug/create-sample-data', async (req: any, res: Response) => {
  try {
    const studentRepo = AppDataSource.getRepository(Student);
    const teacherRepo = AppDataSource.getRepository(Teacher);
    const courseRepo = AppDataSource.getRepository(Course);
    const disciplineRepo = AppDataSource.getRepository(Discipline);
    
    // Check if data already exists
    const existingStudents = await studentRepo.count();
    if (existingStudents > 0) {
      return res.json({ message: 'Dados já existem', students: existingStudents });
    }
    
    // Create sample student
    const student = studentRepo.create({
      name: 'João Silva',
      cpf: '12345678901',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-9999',
      birthDate: new Date('2000-01-15'),
      address: 'Rua Example, 123',
      registrationNumber: '20240001',
      status: StudentStatus.ACTIVE
    });
    await studentRepo.save(student);
    
    // Create sample teacher
    const teacher = teacherRepo.create({
      name: 'Prof. Maria Santos',
      cpf: '98765432109',
      email: 'maria.santos@email.com',
      phone: '(11) 88888-8888',
      department: 'Matemática',
      titulation: 'Mestrado',
      status: TeacherStatus.ACTIVE
    });
    await teacherRepo.save(teacher);
    
    // Create sample course
    const course = courseRepo.create({
      name: 'Ciência da Computação',
      description: 'Curso de BCC',
      workload: 4000,
      modality: CourseModality.PRESENCIAL,
      type: CourseType.GRADUACAO,
      status: CourseStatus.ACTIVE
    });
    await courseRepo.save(course);
    
    // Create sample discipline
    const discipline = disciplineRepo.create({
      name: 'Algoritmos',
      description: 'Introdução a Algoritmos',
      workload: 60,
      credits: 4,
      period: 1,
      courseId: course.id,
      status: DisciplineStatus.ACTIVE
    });
    await disciplineRepo.save(discipline);
    
    res.json({ 
      message: 'Dados de exemplo criados com sucesso',
      data: {
        student: student.name,
        teacher: teacher.name,
        course: course.name,
        discipline: discipline.name
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Erro ao criar dados de exemplo' });
  }
});

export default router;

