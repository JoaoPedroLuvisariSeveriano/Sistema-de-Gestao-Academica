"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const Student_1 = require("../entities/Student");
const Teacher_1 = require("../entities/Teacher");
const auth_1 = require("../middleware/auth");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Direct repository access to avoid 'this' context issues
const userRepository = () => database_1.AppDataSource.getRepository(User_1.User);
const studentRepository = () => database_1.AppDataSource.getRepository(Student_1.Student);
const teacherRepository = () => database_1.AppDataSource.getRepository(Teacher_1.Teacher);
class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email e senha são obrigatórios' });
            }
            // Find user by email
            const user = await userRepository().findOne({
                where: { email },
            });
            if (!user) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }
            // Check if isActive is properly set
            if (user.isActive === false) {
                return res.status(403).json({ error: 'Usuário inativo' });
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }
            // Load relations only for student/teacher roles
            let student = undefined;
            let teacher = undefined;
            if (user.role === User_1.UserRole.STUDENT && user.studentId) {
                student = await studentRepository().findOne({ where: { id: user.studentId } });
            }
            else if (user.role === User_1.UserRole.TEACHER && user.teacherId) {
                teacher = await teacherRepository().findOne({ where: { id: user.teacherId } });
            }
            // Atualizar último login
            user.lastLogin = new Date();
            await userRepository().save(user);
            const token = (0, auth_1.generateToken)({
                id: user.id,
                email: user.email,
                role: user.role,
            });
            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    student,
                    teacher,
                },
            });
        }
        catch (error) {
            console.error('Erro ao fazer login:', error);
            return res.status(500).json({ error: 'Erro ao fazer login' });
        }
    }
    async register(req, res) {
        try {
            const { email, password, cpf, name, phone } = req.body;
            // Verificar se email já existe
            const existingUser = await userRepository().findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }
            // Verificar se CPF pertence a um aluno
            const student = await studentRepository().findOne({ where: { cpf } });
            if (!student) {
                return res.status(400).json({ error: 'CPF não encontrado na base de alunos' });
            }
            // Criar usuário
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const user = userRepository().create({
                email,
                password: hashedPassword,
                role: User_1.UserRole.STUDENT,
                studentId: student.id,
            });
            const savedUser = await userRepository().save(user);
            const token = (0, auth_1.generateToken)({
                id: savedUser.id,
                email: savedUser.email,
                role: savedUser.role,
            });
            return res.status(201).json({
                token,
                user: {
                    id: savedUser.id,
                    email: savedUser.email,
                    role: savedUser.role,
                    student,
                },
            });
        }
        catch (error) {
            console.error('Erro ao registrar:', error);
            return res.status(500).json({ error: 'Erro ao registrar' });
        }
    }
    async getCurrentUser(req, res) {
        try {
            const user = await userRepository().findOne({
                where: { id: req.user?.id },
                relations: ['student', 'teacher'],
            });
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            return res.json({
                id: user.id,
                email: user.email,
                role: user.role,
                student: user.student,
                teacher: user.teacher,
            });
        }
        catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return res.status(500).json({ error: 'Erro ao buscar usuário' });
        }
    }
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const user = await userRepository().findOne({
                where: { id: req.user?.id },
            });
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Senha atual incorreta' });
            }
            user.password = await bcryptjs_1.default.hash(newPassword, 10);
            await userRepository().save(user);
            return res.json({ message: 'Senha alterada com sucesso' });
        }
        catch (error) {
            console.error('Erro ao alterar senha:', error);
            return res.status(500).json({ error: 'Erro ao alterar senha' });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map