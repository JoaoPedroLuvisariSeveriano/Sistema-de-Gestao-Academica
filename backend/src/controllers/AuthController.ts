import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { Student } from '../entities/Student';
import { Teacher } from '../entities/Teacher';
import { generateToken, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

// Direct repository access to avoid 'this' context issues
const userRepository = () => AppDataSource.getRepository(User);
const studentRepository = () => AppDataSource.getRepository(Student);
const teacherRepository = () => AppDataSource.getRepository(Teacher);

export class AuthController {

  async login(req: AuthRequest, res: Response): Promise<Response> {
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

      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Load relations only for student/teacher roles
      let student = undefined;
      let teacher = undefined;
      
      if (user.role === UserRole.STUDENT && user.studentId) {
        student = await studentRepository().findOne({ where: { id: user.studentId } });
      } else if (user.role === UserRole.TEACHER && user.teacherId) {
        teacher = await teacherRepository().findOne({ where: { id: user.teacherId } });
      }

      // Atualizar último login
      user.lastLogin = new Date();
      await userRepository().save(user);

      const token = generateToken({
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
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  async register(req: AuthRequest, res: Response): Promise<Response> {
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
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = userRepository().create({
        email,
        password: hashedPassword,
        role: UserRole.STUDENT,
        studentId: student.id,
      });

      const savedUser = await userRepository().save(user);

      const token = generateToken({
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
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return res.status(500).json({ error: 'Erro ao registrar' });
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response): Promise<Response> {
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
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await userRepository().findOne({
        where: { id: req.user?.id },
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await userRepository().save(user);

      return res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return res.status(500).json({ error: 'Erro ao alterar senha' });
    }
  }
}

