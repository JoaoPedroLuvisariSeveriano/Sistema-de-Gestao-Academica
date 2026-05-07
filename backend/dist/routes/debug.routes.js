"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const Student_1 = require("../entities/Student");
const Teacher_1 = require("../entities/Teacher");
const Course_1 = require("../entities/Course");
const Discipline_1 = require("../entities/Discipline");
const Enrollment_1 = require("../entities/Enrollment");
const Grade_1 = require("../entities/Grade");
const router = (0, express_1.Router)();
// Debug: List all entities counts
router.get('/debug/db-status', async (req, res) => {
    try {
        const studentCount = await database_1.AppDataSource.getRepository(Student_1.Student).count();
        const teacherCount = await database_1.AppDataSource.getRepository(Teacher_1.Teacher).count();
        const courseCount = await database_1.AppDataSource.getRepository(Course_1.Course).count();
        const disciplineCount = await database_1.AppDataSource.getRepository(Discipline_1.Discipline).count();
        const enrollmentCount = await database_1.AppDataSource.getRepository(Enrollment_1.Enrollment).count();
        const gradeCount = await database_1.AppDataSource.getRepository(Grade_1.Grade).count();
        res.json({
            students: studentCount,
            teachers: teacherCount,
            courses: courseCount,
            disciplines: disciplineCount,
            enrollments: enrollmentCount,
            grades: gradeCount
        });
    }
    catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ error: 'Erro ao buscar status do banco' });
    }
});
// Debug: Create sample data
router.post('/debug/create-sample-data', async (req, res) => {
    try {
        const studentRepo = database_1.AppDataSource.getRepository(Student_1.Student);
        const teacherRepo = database_1.AppDataSource.getRepository(Teacher_1.Teacher);
        const courseRepo = database_1.AppDataSource.getRepository(Course_1.Course);
        const disciplineRepo = database_1.AppDataSource.getRepository(Discipline_1.Discipline);
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
            status: Student_1.StudentStatus.ACTIVE
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
            status: Teacher_1.TeacherStatus.ACTIVE
        });
        await teacherRepo.save(teacher);
        // Create sample course
        const course = courseRepo.create({
            name: 'Ciência da Computação',
            description: 'Curso de BCC',
            workload: 4000,
            modality: Course_1.CourseModality.PRESENCIAL,
            type: Course_1.CourseType.GRADUACAO,
            status: Course_1.CourseStatus.ACTIVE
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
            status: Discipline_1.DisciplineStatus.ACTIVE
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
    }
    catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ error: 'Erro ao criar dados de exemplo' });
    }
});
exports.default = router;
//# sourceMappingURL=debug.routes.js.map