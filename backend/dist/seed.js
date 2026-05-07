"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("./config/database");
const User_1 = require("./entities/User");
const Student_1 = require("./entities/Student");
const Teacher_1 = require("./entities/Teacher");
const Course_1 = require("./entities/Course");
const Discipline_1 = require("./entities/Discipline");
const Enrollment_1 = require("./entities/Enrollment");
const DisciplineEnrollment_1 = require("./entities/DisciplineEnrollment");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function seed() {
    try {
        console.log('🔄 Conectando ao banco de dados...');
        await database_1.AppDataSource.initialize();
        console.log('✅ Banco de dados conectado!');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const studentRepository = database_1.AppDataSource.getRepository(Student_1.Student);
        const teacherRepository = database_1.AppDataSource.getRepository(Teacher_1.Teacher);
        const courseRepository = database_1.AppDataSource.getRepository(Course_1.Course);
        const disciplineRepository = database_1.AppDataSource.getRepository(Discipline_1.Discipline);
        const enrollmentRepository = database_1.AppDataSource.getRepository(Enrollment_1.Enrollment);
        const disciplineEnrollmentRepository = database_1.AppDataSource.getRepository(DisciplineEnrollment_1.DisciplineEnrollment);
        // ============================================
        // CRIAR USUÁRIOS
        // ============================================
        // Check if admin already exists
        const adminExists = await userRepository.findOne({
            where: { email: 'admin@gestao.com' }
        });
        if (!adminExists) {
            const hashedPassword = await bcryptjs_1.default.hash('admin123', 10);
            const admin = userRepository.create({
                email: 'admin@gestao.com',
                password: hashedPassword,
                role: User_1.UserRole.ADMIN,
                isActive: true,
            });
            await userRepository.save(admin);
            console.log('✅ Usuário admin criado: admin@gestao.com / admin123');
        }
        else {
            console.log('ℹ️  Usuário admin já existe');
        }
        // Check if secretary already exists
        const secretaryExists = await userRepository.findOne({
            where: { email: 'secretaria@gestao.com' }
        });
        if (!secretaryExists) {
            const hashedPassword = await bcryptjs_1.default.hash('123', 10);
            const secretary = userRepository.create({
                email: 'secretaria@gestao.com',
                password: hashedPassword,
                role: User_1.UserRole.SECRETARY,
                isActive: true,
            });
            await userRepository.save(secretary);
            console.log('✅ Usuário secretária criado: secretaria@gestao.com / 123');
        }
        else {
            console.log('ℹ️  Usuário secretária já existe');
        }
        // Check if teacher user already exists
        const teacherUserExists = await userRepository.findOne({
            where: { email: 'professor@gestao.com' }
        });
        if (!teacherUserExists) {
            const hashedPassword = await bcryptjs_1.default.hash('123', 10);
            const teacherUser = userRepository.create({
                email: 'professor@gestao.com',
                password: hashedPassword,
                role: User_1.UserRole.TEACHER,
                isActive: true,
            });
            await userRepository.save(teacherUser);
            console.log('✅ Usuário professor criado: professor@gestao.com / 123');
        }
        else {
            console.log('ℹ️  Usuário professor já existe');
        }
        // ============================================
        // CRIAR CURSO
        // ============================================
        let course = await courseRepository.findOne({
            where: { name: 'Ciência da Computação' }
        });
        if (!course) {
            course = courseRepository.create({
                name: 'Ciência da Computação',
                description: 'Curso de Bacharelado em Ciência da Computação',
                workload: 4000,
                modality: Course_1.CourseModality.PRESENCIAL,
                type: Course_1.CourseType.GRADUACAO,
                status: Course_1.CourseStatus.ACTIVE,
            });
            await courseRepository.save(course);
            console.log('✅ Curso criado: Ciência da Computação');
        }
        else {
            console.log('ℹ️  Curso já existe');
        }
        // ============================================
        // CRIAR DISCIPLINA
        // ============================================
        const disciplineExists = await disciplineRepository.findOne({
            where: { name: 'Introdução à Programação' }
        });
        if (!disciplineExists && course) {
            const discipline = disciplineRepository.create({
                name: 'Introdução à Programação',
                description: 'Conceitos fundamentais de programação',
                ementa: 'Conceitos básicos de algoritmos e lógica de programação',
                workload: 60,
                credits: 4,
                period: 1,
                course: course,
                courseId: course.id,
                status: Discipline_1.DisciplineStatus.ACTIVE,
            });
            await disciplineRepository.save(discipline);
            console.log('✅ Disciplina criada: Introdução à Programação');
        }
        else {
            console.log('ℹ️  Disciplina já existe');
        }
        // ============================================
        // CRIAR PROFESSOR
        // ============================================
        const teacherExists = await teacherRepository.findOne({
            where: { cpf: '12345678902' }
        });
        if (!teacherExists) {
            const teacher = teacherRepository.create({
                cpf: '12345678902',
                name: 'Maria Santos',
                email: 'maria.santos@email.com',
                phone: '(11) 88888-8888',
                department: 'Computação',
                titulation: 'Mestre',
                formation: 'Ciência da Computação',
                status: Teacher_1.TeacherStatus.ACTIVE,
            });
            await teacherRepository.save(teacher);
            console.log('✅ Professor criado: Maria Santos');
        }
        else {
            console.log('ℹ️  Professor já existe');
        }
        // ============================================
        // CRIAR ALUNO
        // ============================================
        let student = await studentRepository.findOne({
            where: { cpf: '12345678901' }
        });
        if (!student) {
            student = studentRepository.create({
                cpf: '12345678901',
                name: 'João da Silva',
                email: 'joao.silva@email.com',
                phone: '(11) 99999-9999',
                address: 'Rua Example, 123',
                registrationNumber: '20240001',
                status: Student_1.StudentStatus.ACTIVE,
            });
            await studentRepository.save(student);
            console.log('✅ Aluno criado: João da Silva');
        }
        else {
            console.log('ℹ️  Aluno João da Silva já existe');
        }
        // ============================================
        // CRIAR MATRÍCULA DO ALUNO NO CURSO (Enrollment)
        // ============================================
        if (student && course) {
            const currentYear = new Date().getFullYear();
            const currentPeriod = new Date().getMonth() < 6 ? 1 : 2;
            let enrollment = await enrollmentRepository.findOne({
                where: {
                    studentId: student.id,
                    courseId: course.id,
                    status: Enrollment_1.EnrollmentStatus.ACTIVE
                }
            });
            if (!enrollment) {
                enrollment = enrollmentRepository.create({
                    studentId: student.id,
                    courseId: course.id,
                    year: currentYear,
                    period: currentPeriod,
                    status: Enrollment_1.EnrollmentStatus.ACTIVE,
                });
                await enrollmentRepository.save(enrollment);
                console.log(`✅ Matrícula do aluno no curso criada: João da Silva - Ciência da Computação (${currentYear}/${currentPeriod})`);
            }
            else {
                console.log('ℹ️  Matrícula do aluno no curso já existe');
            }
            // ============================================
            // CRIAR MATRÍCULA DO ALUNO NA DISCIPLINA (DisciplineEnrollment)
            // ============================================
            // Buscar a disciplina criada
            const discipline = await disciplineRepository.findOne({
                where: { name: 'Introdução à Programação' }
            });
            // Buscar o professor criado
            const teacher = await teacherRepository.findOne({
                where: { cpf: '12345678902' }
            });
            if (discipline && teacher && enrollment) {
                let disciplineEnrollment = await disciplineEnrollmentRepository.findOne({
                    where: {
                        enrollmentId: enrollment.id,
                        disciplineId: discipline.id,
                    }
                });
                if (!disciplineEnrollment) {
                    disciplineEnrollment = disciplineEnrollmentRepository.create({
                        enrollmentId: enrollment.id,
                        disciplineId: discipline.id,
                        teacherId: teacher.id,
                        year: currentYear,
                        period: currentPeriod,
                        status: DisciplineEnrollment_1.DisciplineEnrollmentStatus.ACTIVE,
                    });
                    await disciplineEnrollmentRepository.save(disciplineEnrollment);
                    console.log(`✅ Matrícula na disciplina criada: João da Silva - Introdução à Programação`);
                }
                else {
                    console.log('ℹ️  Matrícula na disciplina já existe');
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
        enrollments.forEach(e => console.log(`   - Aluno ID: ${e.studentId} - Curso ID: ${e.courseId}`));
        const disciplineEnrollments = await disciplineEnrollmentRepository.find();
        console.log(`   Total de matrículas em disciplinas: ${disciplineEnrollments.length}`);
        disciplineEnrollments.forEach(de => console.log(`   - Enrollment ID: ${de.enrollmentId} - Disciplina ID: ${de.disciplineId}`));
        console.log('\n✅ Seed concluído com sucesso!');
        await database_1.AppDataSource.destroy();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erro ao executar seed:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed.js.map