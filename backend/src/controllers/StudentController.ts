
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Student, StudentStatus } from '../entities/Student';
import { validateCPF } from '../utils/validation';
import { AuthRequest } from '../middleware/auth';

export class StudentController {
  // RF#01 - Cadastro de dados pessoais e acadêmicos
  create = async (req: Request, res: Response): Promise<Response> => {
    const studentRepository = AppDataSource.getRepository(Student);
    
    try {
      const { cpf, name, email, phone, address, birthDate } = req.body;

      console.log('[Student] Received data:', { cpf, name, email, phone, address, birthDate });

      // Validar campos obrigatórios
      if (!cpf || cpf.trim() === '') {
        return res.status(400).json({ error: 'CPF é obrigatório' });
      }
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }
      if (!email || email.trim() === '') {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }

      // Validar CPF
      const isValidCPF = validateCPF(cpf);
      console.log('[Student] CPF validation result:', isValidCPF);
      if (!isValidCPF) {
        return res.status(400).json({ error: 'CPF inválido. O CPF deve ter 11 dígitos válidos.' });
      }

      // Verificar se CPF já está cadastrado
      const existingStudent = await studentRepository.findOne({ where: { cpf } });
      if (existingStudent) {
        return res.status(400).json({ error: 'CPF já cadastrado' });
      }

      // Verificar se email já está em uso
      const existingEmail = await studentRepository.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Gerar número de matrícula
      const registrationNumber = await this.generateRegistrationNumber(studentRepository);

      const student = studentRepository.create({
        cpf: cpf.trim(),
        name: name.trim(),
        email: email.trim(),
        phone: phone || '',
        address: address || '',
        birthDate: birthDate ? new Date(birthDate) : undefined,
        registrationNumber,
        status: StudentStatus.ACTIVE,
      });

      console.log('[Student] Saving student:', student);
      const savedStudent = await studentRepository.save(student);
      console.log('[Student] Student saved successfully:', savedStudent.id);
      
      return res.status(201).json(savedStudent);
    } catch (error: any) {
      console.error('[Student] Erro ao criar aluno:', error);
      return res.status(500).json({ error: error.message || 'Erro ao criar aluno. Verifique os dados e tente novamente.' });
    }
  }

  findAll = async (req: AuthRequest, res: Response): Promise<Response> => {
    const studentRepository = AppDataSource.getRepository(Student);
    
    try {
      const { name, registrationNumber, cpf, courseId, status, page = 1, limit = 10 } = req.query;

      const query = studentRepository.createQueryBuilder('student')
        .leftJoinAndSelect('student.enrollments', 'enrollments')
        .leftJoinAndSelect('enrollments.course', 'course');

      if (name) {
        query.andWhere('student.name ILIKE :name', { name: `%${name}%` });
      }
      if (registrationNumber) {
        query.andWhere('student.registrationNumber = :registrationNumber', { registrationNumber });
      }
      if (cpf) {
        query.andWhere('student.cpf = :cpf', { cpf });
      }
      if (courseId) {
        query.andWhere('course.id = :courseId', { courseId });
      }
      if (status) {
        query.andWhere('student.status = :status', { status });
      }

      const skip = (Number(page) - 1) * Number(limit);
      query.skip(skip).take(Number(limit));

      const [students, total] = await query.getManyAndCount();

      return res.json({
        data: students,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (error: any) {
      console.error('Erro ao buscar alunos:', error);
      return res.status(500).json({ error: error.message || 'Erro ao buscar alunos' });
    }
  }

  findById = async (req: Request, res: Response): Promise<Response> => {
    const studentRepository = AppDataSource.getRepository(Student);
    
    try {
      const { id } = req.params;
      const student = await studentRepository.findOne({
        where: { id },
        relations: ['enrollments', 'enrollments.course', 'academicHistory'],
      });

      if (!student) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      return res.json(student);
    } catch (error: any) {
      console.error('Erro ao buscar aluno:', error);
      return res.status(500).json({ error: error.message || 'Erro ao buscar aluno' });
    }
  }

  update = async (req: AuthRequest, res: Response): Promise<Response> => {
    const studentRepository = AppDataSource.getRepository(Student);
    
    try {
      const { id } = req.params;
      const { name, email, phone, address, birthDate } = req.body;

      const student = await studentRepository.findOne({ where: { id } });
      if (!student) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      if (name) student.name = name;
      if (email) student.email = email;
      if (phone) student.phone = phone;
      if (address) student.address = address;
      if (birthDate) student.birthDate = new Date(birthDate);

      const updatedStudent = await studentRepository.save(student);
      
      return res.json(updatedStudent);
    } catch (error: any) {
      console.error('Erro ao atualizar aluno:', error);
      return res.status(500).json({ error: error.message || 'Erro ao atualizar aluno' });
    }
  }

  inactivate = async (req: AuthRequest, res: Response): Promise<Response> => {
    const studentRepository = AppDataSource.getRepository(Student);
    
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const student = await studentRepository.findOne({ where: { id } });
      if (!student) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      student.status = StudentStatus.INACTIVE;
      student.inactiveReason = reason || 'Inativação solicitada';
      student.inactiveDate = new Date();

      const updatedStudent = await studentRepository.save(student);
      
      return res.json({ message: 'Aluno inativado com sucesso', student: updatedStudent });
    } catch (error: any) {
      console.error('Erro ao inativar aluno:', error);
      return res.status(500).json({ error: error.message || 'Erro ao inativar aluno' });
    }
  }

  async generateRegistrationNumber(studentRepository: any): Promise<string> {
    const currentYear = new Date().getFullYear();
    
    const lastStudent = await studentRepository
      .createQueryBuilder('student')
      .where('student.registrationNumber LIKE :year', { year: `${currentYear}%` })
      .orderBy('student.registrationNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastStudent) {
      const lastSequence = parseInt(lastStudent.registrationNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${currentYear}${sequence.toString().padStart(4, '0')}`;
  }
}


