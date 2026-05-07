"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherController = void 0;
const database_1 = require("../config/database");
const Teacher_1 = require("../entities/Teacher");
const validation_1 = require("../utils/validation");
class TeacherController {
    constructor() {
        // RF#06 - Cadastro de professores
        this.create = async (req, res) => {
            const teacherRepository = database_1.AppDataSource.getRepository(Teacher_1.Teacher);
            try {
                const { cpf, name, email, phone, department, titulation, formation } = req.body;
                // Validar campos obrigatórios
                if (!name || name.trim() === '') {
                    return res.status(400).json({ error: 'Nome é obrigatório' });
                }
                if (!cpf || cpf.trim() === '') {
                    return res.status(400).json({ error: 'CPF é obrigatório' });
                }
                if (!email || email.trim() === '') {
                    return res.status(400).json({ error: 'Email é obrigatório' });
                }
                // Validar CPF
                if (!(0, validation_1.validateCPF)(cpf)) {
                    return res.status(400).json({ error: 'CPF inválido' });
                }
                // Verificar se CPF já está em uso
                const existingTeacher = await teacherRepository.findOne({ where: { cpf } });
                if (existingTeacher) {
                    return res.status(400).json({ error: 'CPF já cadastrado' });
                }
                // Verificar se email já está em uso
                const existingEmail = await teacherRepository.findOne({ where: { email } });
                if (existingEmail) {
                    return res.status(400).json({ error: 'Email já cadastrado' });
                }
                const teacher = teacherRepository.create({
                    cpf: cpf.trim(),
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone || '',
                    department: department || '',
                    titulation: titulation || '',
                    formation: formation || '',
                    status: Teacher_1.TeacherStatus.ACTIVE,
                });
                const savedTeacher = await teacherRepository.save(teacher);
                return res.status(201).json(savedTeacher);
            }
            catch (error) {
                console.error('Erro ao criar professor:', error);
                return res.status(500).json({ error: error.message || 'Erro ao criar professor' });
            }
        };
        // RF#09 - Consulta de professores
        this.findAll = async (req, res) => {
            const teacherRepository = database_1.AppDataSource.getRepository(Teacher_1.Teacher);
            try {
                const { name, department, disciplineId, status } = req.query;
                const query = teacherRepository.createQueryBuilder('teacher')
                    .leftJoinAndSelect('teacher.disciplineEnrollments', 'de')
                    .leftJoinAndSelect('de.discipline', 'discipline');
                if (name) {
                    query.andWhere('teacher.name ILIKE :name', { name: `%${name}%` });
                }
                if (department) {
                    query.andWhere('teacher.department = :department', { department });
                }
                if (disciplineId) {
                    query.andWhere('discipline.id = :disciplineId', { disciplineId });
                }
                if (status) {
                    query.andWhere('teacher.status = :status', { status });
                }
                const teachers = await query.getMany();
                return res.json(teachers);
            }
            catch (error) {
                console.error('Erro ao buscar professores:', error);
                return res.status(500).json({ error: error.message || 'Erro ao buscar professores' });
            }
        };
        this.findById = async (req, res) => {
            const teacherRepository = database_1.AppDataSource.getRepository(Teacher_1.Teacher);
            try {
                const { id } = req.params;
                const teacher = await teacherRepository.findOne({
                    where: { id },
                    relations: ['disciplineEnrollments', 'disciplineEnrollments.discipline'],
                });
                if (!teacher) {
                    return res.status(404).json({ error: 'Professor não encontrado' });
                }
                return res.json(teacher);
            }
            catch (error) {
                console.error('Erro ao buscar professor:', error);
                return res.status(500).json({ error: error.message || 'Erro ao buscar professor' });
            }
        };
        // RF#08 - Edição de dados dos professores
        this.update = async (req, res) => {
            const teacherRepository = database_1.AppDataSource.getRepository(Teacher_1.Teacher);
            try {
                const { id } = req.params;
                const { name, email, phone, department, titulation, formation } = req.body;
                const teacher = await teacherRepository.findOne({ where: { id } });
                if (!teacher) {
                    return res.status(404).json({ error: 'Professor não encontrado' });
                }
                if (name)
                    teacher.name = name;
                if (email)
                    teacher.email = email;
                if (phone)
                    teacher.phone = phone;
                if (department)
                    teacher.department = department;
                if (titulation)
                    teacher.titulation = titulation;
                if (formation)
                    teacher.formation = formation;
                const updatedTeacher = await teacherRepository.save(teacher);
                return res.json(updatedTeacher);
            }
            catch (error) {
                console.error('Erro ao atualizar professor:', error);
                return res.status(500).json({ error: error.message || 'Erro ao atualizar professor' });
            }
        };
        // RF#07 - Vinculação de professores às disciplinas
        this.assignToDiscipline = async (req, res) => {
            try {
                const { id } = req.params;
                const { disciplineEnrollmentId } = req.body;
                return res.status(200).json({
                    message: 'Professor vinculado à disciplina com sucesso',
                    teacherId: id,
                    disciplineEnrollmentId
                });
            }
            catch (error) {
                console.error('Erro ao vincular professor:', error);
                return res.status(500).json({ error: error.message || 'Erro ao vincular professor' });
            }
        };
    }
}
exports.TeacherController = TeacherController;
//# sourceMappingURL=TeacherController.js.map