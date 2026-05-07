import 'reflect-metadata';
import { AppDataSource } from './config/database';
import { User, UserRole } from './entities/User';
import { Student, StudentStatus } from './entities/Student';
import { Teacher, TeacherStatus } from './entities/Teacher';
import { Course, CourseModality, CourseType, CourseStatus } from './entities/Course';
import { Discipline, DisciplineStatus } from './entities/Discipline';
import { Enrollment, EnrollmentStatus } from './entities/Enrollment';
import { DisciplineEnrollment, DisciplineEnrollmentStatus } from './entities/DisciplineEnrollment';
import { AcademicHistory, AcademicHistoryStatus } from './entities/AcademicHistory';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('✅ Banco de dados conectado!');

    const userRepository = AppDataSource.getRepository(User);
    const studentRepository = AppDataSource.getRepository(Student);
    const teacherRepository = AppDataSource.getRepository(Teacher);
    const courseRepository = AppDataSource.getRepository(Course);
    const disciplineRepository = AppDataSource.getRepository(Discipline);
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const disciplineEnrollmentRepository = AppDataSource.getRepository(DisciplineEnrollment);
    const academicHistoryRepository = AppDataSource.getRepository(AcademicHistory);

    // ============================================
    // CRIAR USUÁRIOS
    // ============================================
    
    // Check if admin already exists
    const adminExists = await userRepository.findOne({ 
      where: { email: 'admin@gestao.com' } 
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = userRepository.create({
        email: 'admin@gestao.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      });
      await userRepository.save(admin);
      console.log('✅ Usuário admin criado: admin@gestao.com / admin123');
    } else {
      console.log('ℹ️  Usuário admin já existe');
    }

    // Check if secretary already exists
    const secretaryExists = await userRepository.findOne({ 
      where: { email: 'secretaria@gestao.com' } 
    });

    if (!secretaryExists) {
      const hashedPassword = await bcrypt.hash('123', 10);
      const secretary = userRepository.create({
        email: 'secretaria@gestao.com',
        password: hashedPassword,
        role: UserRole.SECRETARY,
        isActive: true,
      });
      await userRepository.save(secretary);
      console.log('✅ Usuário secretária criado: secretaria@gestao.com / 123');
    } else {
      console.log('ℹ️  Usuário secretária já existe');
    }

    // Check if teacher user already exists
    const teacherUserExists = await userRepository.findOne({ 
      where: { email: 'professor@gestao.com' } 
    });

    if (!teacherUserExists) {
      const hashedPassword = await bcrypt.hash('123', 10);
      const teacherUser = userRepository.create({
        email: 'professor@gestao.com',
        password: hashedPassword,
        role: UserRole.TEACHER,
        isActive: true,
      });
      await userRepository.save(teacherUser);
      console.log('✅ Usuário professor criado: professor@gestao.com / 123');
    } else {
      console.log('ℹ️  Usuário professor já existe');
    }

    // ============================================
    // CRIAR CURSOS
    // ============================================
    
    // Curso 1: Ciência da Computação
    let course1 = await courseRepository.findOne({
      where: { name: 'Ciência da Computação' }
    });
    
    if (!course1) {
      course1 = courseRepository.create({
        name: 'Ciência da Computação',
        description: 'Curso de Bacharelado em Ciência da Computação',
        workload: 4000,
        modality: CourseModality.PRESENCIAL,
        type: CourseType.GRADUACAO,
        status: CourseStatus.ACTIVE,
      });
      await courseRepository.save(course1);
      console.log('✅ Curso criado: Ciência da Computação');
    } else {
      console.log('ℹ️  Curso CC já existe');
    }

    // Curso 2: Análise e Desenvolvimento de Sistemas
    let course2 = await courseRepository.findOne({
      where: { name: 'Análise e Desenvolvimento de Sistemas' }
    });
    
    if (!course2) {
      course2 = courseRepository.create({
        name: 'Análise e Desenvolvimento de Sistemas',
        description: 'Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas',
        workload: 2400,
        modality: CourseModality.PRESENCIAL,
        type: CourseType.TECNICO,
        status: CourseStatus.ACTIVE,
      });
      await courseRepository.save(course2);
      console.log('✅ Curso criado: Análise e Desenvolvimento de Sistemas');
    } else {
      console.log('ℹ️  Curso ADS já existe');
    }

    // Curso 3: Engenharia de Software
    let course3 = await courseRepository.findOne({
      where: { name: 'Engenharia de Software' }
    });
    
    if (!course3) {
      course3 = courseRepository.create({
        name: 'Engenharia de Software',
        description: 'Curso de Bacharelado em Engenharia de Software',
        workload: 3600,
        modality: CourseModality.PRESENCIAL,
        type: CourseType.GRADUACAO,
        status: CourseStatus.ACTIVE,
      });
      await courseRepository.save(course3);
      console.log('✅ Curso criado: Engenharia de Software');
    } else {
      console.log('ℹ️  Curso Engenharia de Software já existe');
    }

    // ============================================
    // CRIAR DISCIPLINAS POR CURSO
    // ============================================
    
    const currentYear = new Date().getFullYear();
    const currentPeriod = new Date().getMonth() < 6 ? 1 : 2;

    // Disciplinas do Curso 1 - Ciência da Computação
    const disciplinesCC = [
      { name: 'Introdução à Programação', workload: 60, period: 1 },
      { name: 'Algoritmos e Estruturas de Dados', workload: 80, period: 2 },
      { name: 'Banco de Dados I', workload: 60, period: 3 },
      { name: 'Engenharia de Software I', workload: 60, period: 4 },
    ];

    const ccDisciplines = [];
    for (const d of disciplinesCC) {
      let discipline = await disciplineRepository.findOne({
        where: { name: d.name, courseId: course1.id }
      });
      
      if (!discipline && course1) {
        discipline = disciplineRepository.create({
          name: d.name,
          description: `Disciplina de ${d.name}`,
          ementa: `Ementa de ${d.name}`,
          workload: d.workload,
          credits: Math.floor(d.workload / 15),
          period: d.period,
          course: course1,
          courseId: course1.id,
          status: DisciplineStatus.ACTIVE,
        });
        await disciplineRepository.save(discipline);
        console.log(`✅ Disciplina criada: ${d.name} (CC)`);
      }
      if (discipline) ccDisciplines.push(discipline);
    }

    // Disciplinas do Curso 2 - ADS
    const disciplinesADS = [
      { name: 'Programação Web', workload: 60, period: 1 },
      { name: 'Lógica de Programação', workload: 60, period: 1 },
      { name: 'Gestão de Projetos', workload: 40, period: 3 },
      { name: 'Qualidade de Software', workload: 40, period: 4 },
    ];

    const adsDisciplines = [];
    for (const d of disciplinesADS) {
      let discipline = await disciplineRepository.findOne({
        where: { name: d.name, courseId: course2.id }
      });
      
      if (!discipline && course2) {
        discipline = disciplineRepository.create({
          name: d.name,
          description: `Disciplina de ${d.name}`,
          ementa: `Ementa de ${d.name}`,
          workload: d.workload,
          credits: Math.floor(d.workload / 15),
          period: d.period,
          course: course2,
          courseId: course2.id,
          status: DisciplineStatus.ACTIVE,
        });
        await disciplineRepository.save(discipline);
        console.log(`✅ Disciplina criada: ${d.name} (ADS)`);
      }
      if (discipline) adsDisciplines.push(discipline);
    }

    // Disciplinas do Curso 3 - Engenharia de Software
    const disciplinesES = [
      { name: 'Engenharia de Requisitos', workload: 60, period: 1 },
      { name: 'Design Patterns', workload: 60, period: 3 },
      { name: 'Testes de Software', workload: 60, period: 4 },
      { name: 'Arquitetura de Software', workload: 80, period: 5 },
    ];

    const esDisciplines = [];
    for (const d of disciplinesES) {
      let discipline = await disciplineRepository.findOne({
        where: { name: d.name, courseId: course3.id }
      });
      
      if (!discipline && course3) {
        discipline = disciplineRepository.create({
          name: d.name,
          description: `Disciplina de ${d.name}`,
          ementa: `Ementa de ${d.name}`,
          workload: d.workload,
          credits: Math.floor(d.workload / 15),
          period: d.period,
          course: course3,
          courseId: course3.id,
          status: DisciplineStatus.ACTIVE,
        });
        await disciplineRepository.save(discipline);
        console.log(`✅ Disciplina criada: ${d.name} (ES)`);
      }
      if (discipline) esDisciplines.push(discipline);
    }

    // ============================================
    // CRIAR PROFESSORES
    // ============================================
    
    // Professor 1
    let teacher1 = await teacherRepository.findOne({
      where: { cpf: '12345678902' }
    });
    
    if (!teacher1) {
      teacher1 = teacherRepository.create({
        cpf: '12345678902',
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '(11) 88888-8888',
        department: 'Computação',
        titulation: 'Mestre',
        formation: 'Ciência da Computação',
        status: TeacherStatus.ACTIVE,
      });
      await teacherRepository.save(teacher1);
      console.log('✅ Professor criado: Maria Santos');
    } else {
      console.log('ℹ️  Professor Maria Santos já existe');
    }

    // Professor 2
    let teacher2 = await teacherRepository.findOne({
      where: { cpf: '12345678903' }
    });
    
    if (!teacher2) {
      teacher2 = teacherRepository.create({
        cpf: '12345678903',
        name: 'José Silva',
        email: 'jose.silva@email.com',
        phone: '(11) 88888-8889',
        department: 'Computação',
        titulation: 'Doutor',
        formation: 'Engenharia de Software',
        status: TeacherStatus.ACTIVE,
      });
      await teacherRepository.save(teacher2);
      console.log('✅ Professor criado: José Silva');
    } else {
      console.log('ℹ️  Professor José Silva já existe');
    }

    // ============================================
    // CRIAR ALUNOS
    // ============================================
    
    // Lista de alunos - buscar os que já existem ou criar novos
    const studentsData = [
      { cpf: '12345678901', name: 'João da Silva', email: 'joao.silva@email.com', registration: '20240001' },
      { cpf: '12345678904', name: 'Maria Oliveira', email: 'maria.oliveira@email.com', registration: '20240002' },
      { cpf: '12345678905', name: 'Pedro Santos', email: 'pedro.santos@email.com', registration: '20240003' },
      { cpf: '12345678906', name: 'Ana Costa', email: 'ana.costa@email.com', registration: '20240004' },
      { cpf: '12345678907', name: 'Carlos Lima', email: 'carlos.lima@email.com', registration: '20240005' },
    ];

    const createdStudents = [];
    for (const s of studentsData) {
      let student = await studentRepository.findOne({
        where: { cpf: s.cpf }
      });
      
      // Se não encontrar pelo CPF, tenta pelo email ou cria novo
      if (!student) {
        student = await studentRepository.findOne({
          where: { email: s.email }
        });
      }
      
      // Se ainda não existir, cria novo
      if (!student) {
        student = studentRepository.create({
          cpf: s.cpf,
          name: s.name,
          email: s.email,
          phone: '(11) 99999-9999',
          address: 'Rua Example, 123',
          registrationNumber: s.registration,
          status: StudentStatus.ACTIVE,
        });
        await studentRepository.save(student);
        console.log(`✅ Aluno criado: ${s.name}`);
      } else {
        console.log(`ℹ️  Aluno já existe: ${student.name}`);
      }
      if (student) createdStudents.push(student);
    }

    // ============================================
    // MATRICULAR ALUNOS EM CURSOS E DISCIPLINAS
    // ============================================

    // Distribuir alunos entre os cursos:
    // - João da Silva -> CC
    // - Maria Oliveira -> CC  
    // - Pedro Santos -> ADS
    // - Ana Costa -> ADS
    // - Carlos Lima -> ES

    const courseEnrollmentMap = [
      { studentIndex: 0, course: course1, disciplines: ccDisciplines }, // João - CC
      { studentIndex: 1, course: course1, disciplines: ccDisciplines }, // Maria - CC
      { studentIndex: 2, course: course2, disciplines: adsDisciplines }, // Pedro - ADS
      { studentIndex: 3, course: course2, disciplines: adsDisciplines }, // Ana - ADS
      { studentIndex: 4, course: course3, disciplines: esDisciplines },  // Carlos - ES
    ];

    for (const mapping of courseEnrollmentMap) {
      const student = createdStudents[mapping.studentIndex];
      if (!student || !mapping.course) continue;

      // Criar matrícula no curso
      let enrollment = await enrollmentRepository.findOne({
        where: { 
          studentId: student.id,
          courseId: mapping.course.id,
          status: EnrollmentStatus.ACTIVE
        }
      });
      
      if (!enrollment) {
        enrollment = enrollmentRepository.create({
          studentId: student.id,
          courseId: mapping.course.id,
          year: currentYear,
          period: currentPeriod,
          status: EnrollmentStatus.ACTIVE,
        });
        await enrollmentRepository.save(enrollment);
        console.log(`✅ Matrícula no curso: ${student.name} - ${mapping.course.name}`);
      }

      // Matricular em disciplinas
      const teacher = mapping.studentIndex % 2 === 0 ? teacher1 : teacher2;
      
      for (const discipline of mapping.disciplines) {
        let disciplineEnrollment = await disciplineEnrollmentRepository.findOne({
          where: {
            enrollmentId: enrollment.id,
            disciplineId: discipline.id,
          }
        });

        if (!disciplineEnrollment && teacher) {
          disciplineEnrollment = disciplineEnrollmentRepository.create({
            enrollmentId: enrollment.id,
            disciplineId: discipline.id,
            teacherId: teacher.id,
            year: currentYear,
            period: currentPeriod,
            status: DisciplineEnrollmentStatus.ACTIVE,
          });
          await disciplineEnrollmentRepository.save(disciplineEnrollment);
          console.log(`✅ Matrícula na disciplina: ${student.name} - ${discipline.name}`);

          // Criar registro no histórico acadêmico
          const academicHistory = academicHistoryRepository.create({
            studentId: student.id,
            disciplineId: discipline.id,
            disciplineName: discipline.name,
            courseName: mapping.course.name,
            year: currentYear,
            period: currentPeriod,
            status: AcademicHistoryStatus.IN_PROGRESS,
            workload: discipline.workload,
          });
          await academicHistoryRepository.save(academicHistory);
        }
      }
    }

    // ============================================
    // VERIFICAR DADOS INSERIDOS
    // ============================================
    
    console.log('\n📋 Verificando dados inseridos...');
    
    const users = await userRepository.find();
    console.log(`   Total de usuários: ${users.length}`);
    users.forEach(u => console.log(`   - ${u.email} (${u.role})`));
    
    const students = await studentRepository.find();
    console.log(`   Total de alunos: ${students.length}`);
    students.forEach(s => console.log(`   - ${s.name} (${s.registrationNumber})`));
    
    const courses = await courseRepository.find();
    console.log(`   Total de cursos: ${courses.length}`);
    courses.forEach(c => console.log(`   - ${c.name}`));

    const enrollments = await enrollmentRepository.find();
    console.log(`   Total de matrículas: ${enrollments.length}`);

    const disciplineEnrollments = await disciplineEnrollmentRepository.find();
    console.log(`   Total de matrículas em disciplinas: ${disciplineEnrollments.length}`);

    console.log('\n✅ Seed concluído com sucesso!');
    console.log('\n📌 Resumo:');
    console.log(`   - ${students.length} alunos`);
    console.log(`   - ${courses.length} cursos`);
    console.log(`   - ${disciplineEnrollments.length} matrículas em disciplinas`);
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao executar seed:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

seed();

