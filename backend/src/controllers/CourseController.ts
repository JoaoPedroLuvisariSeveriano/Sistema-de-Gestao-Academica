
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Course, CourseStatus } from '../entities/Course';
import { Discipline } from '../entities/Discipline';
import { AuthRequest } from '../middleware/auth';

export class CourseController {
  // RF#10 - Cadastro de cursos
  create = async (req: AuthRequest, res: Response): Promise<Response> => {
    const courseRepository = AppDataSource.getRepository(Course);
    
    try {
      const { name, description, workload, modality, type } = req.body;

      // Validar campos obrigatórios
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Nome do curso é obrigatório' });
      }

      // Verificar se curso com mesmo nome já existe
      const existingCourse = await courseRepository.findOne({ where: { name } });
      if (existingCourse) {
        return res.status(400).json({ error: 'Curso com este nome já existe' });
      }

      // Validate and normalize modality
      let normalizedModality = 'Presencial';
      if (modality) {
        // Map frontend values to enum values
        const modalityMap: { [key: string]: string } = {
          'presencial': 'Presencial',
          'Presencial': 'Presencial',
          'ead': 'EAD',
          'EAD': 'EAD',
          'hibrido': 'Híbrido',
          'híbrido': 'Híbrido',
          'Híbrido': 'Híbrido',
        };
        normalizedModality = modalityMap[modality.toLowerCase()] || modality;
      }

      // Normalize type
      let normalizedType = 'graduacao';
      if (type) {
        const typeMap: { [key: string]: string } = {
          'graduacao': 'graduacao',
          'Graduação': 'graduacao',
          'tecnico': 'tecnico',
          'Técnico': 'tecnico',
          'pos_graduacao': 'pos_graduacao',
          'pos-graduacao': 'pos_graduacao',
          'Pós-Graduação': 'pos_graduacao',
        };
        normalizedType = typeMap[type.toLowerCase()] || type.toLowerCase().replace(' ', '_');
      }

      const course = courseRepository.create({
        name: name.trim(),
        description: description || '',
        workload: workload || 0,
        modality: normalizedModality as any,
        type: normalizedType as any,
        status: CourseStatus.ACTIVE,
      });

      const savedCourse = await courseRepository.save(course);
      return res.status(201).json(savedCourse);
    } catch (error: any) {
      console.error('Erro ao criar curso:', error);
      return res.status(500).json({ error: error.message || 'Erro ao criar curso' });
    }
  }

  // Consulta de cursos
  findAll = async (req: AuthRequest, res: Response): Promise<Response> => {
    const courseRepository = AppDataSource.getRepository(Course);
    
    try {
      const { name, status, modality, type } = req.query;

      const query = courseRepository.createQueryBuilder('course')
        .leftJoinAndSelect('course.disciplines', 'discipline');

      if (name) {
        query.andWhere('course.name ILIKE :name', { name: `%${name}%` });
      }
      if (status) {
        query.andWhere('course.status = :status', { status });
      }
      if (modality) {
        query.andWhere('course.modality = :modality', { modality });
      }
      if (type) {
        query.andWhere('course.type = :type', { type });
      }

      const courses = await query.getMany();
      return res.json(courses);
    } catch (error: any) {
      console.error('Erro ao buscar cursos:', error);
      return res.status(500).json({ error: error.message || 'Erro ao buscar cursos' });
    }
  }

  findById = async (req: AuthRequest, res: Response): Promise<Response> => {
    const courseRepository = AppDataSource.getRepository(Course);
    
    try {
      const { id } = req.params;
      const course = await courseRepository.findOne({
        where: { id },
        relations: ['disciplines', 'enrollments'],
      });

      if (!course) {
        return res.status(404).json({ error: 'Curso não encontrado' });
      }

      return res.json(course);
    } catch (error: any) {
      console.error('Erro ao buscar curso:', error);
      return res.status(500).json({ error: error.message || 'Erro ao buscar curso' });
    }
  }

  // RF#12 - Definição de carga horária total e atualização
  update = async (req: AuthRequest, res: Response): Promise<Response> => {
    const courseRepository = AppDataSource.getRepository(Course);
    
    try {
      const { id } = req.params;
      const { name, description, workload, modality, type } = req.body;

      const course = await courseRepository.findOne({ where: { id } });
      if (!course) {
        return res.status(404).json({ error: 'Curso não encontrado' });
      }

      if (name) course.name = name;
      if (description) course.description = description;
      if (workload) course.workload = workload;
      if (modality) {
        const modalityMap: { [key: string]: string } = {
          'presencial': 'Presencial',
          'Presencial': 'Presencial',
          'ead': 'EAD',
          'EAD': 'EAD',
          'hibrido': 'Híbrido',
          'híbrido': 'Híbrido',
          'Híbrido': 'Híbrido',
        };
        course.modality = modalityMap[modality.toLowerCase()] as any || modality;
      }
      if (type) {
        const typeMap: { [key: string]: string } = {
          'graduacao': 'graduacao',
          'Graduação': 'graduacao',
          'tecnico': 'tecnico',
          'Técnico': 'tecnico',
          'pos_graduacao': 'pos_graduacao',
          'pos-graduacao': 'pos_graduacao',
          'Pós-Graduação': 'pos_graduacao',
        };
        course.type = typeMap[type.toLowerCase()] as any || type.toLowerCase().replace(' ', '_');
      }

      const updatedCourse = await courseRepository.save(course);
      return res.json(updatedCourse);
    } catch (error: any) {
      console.error('Erro ao atualizar curso:', error);
      return res.status(500).json({ error: error.message || 'Erro ao atualizar curso' });
    }
  }

  // RF#13 - Ativação ou desativação de cursos
  toggleStatus = async (req: AuthRequest, res: Response): Promise<Response> => {
    const courseRepository = AppDataSource.getRepository(Course);
    
    try {
      const { id } = req.params;

      const course = await courseRepository.findOne({ where: { id } });
      if (!course) {
        return res.status(404).json({ error: 'Curso não encontrado' });
      }

      course.status = course.status === CourseStatus.ACTIVE 
        ? CourseStatus.INACTIVE 
        : CourseStatus.ACTIVE;

      const updatedCourse = await courseRepository.save(course);
      return res.json({ 
        message: `Curso ${course.status === CourseStatus.ACTIVE ? 'ativado' : 'desativado'} com sucesso`,
        course: updatedCourse 
      });
    } catch (error: any) {
      console.error('Erro ao alterar status do curso:', error);
      return res.status(500).json({ error: error.message || 'Erro ao alterar status do curso' });
    }
  }

  // RF#11 - Vinculação de disciplinas aos cursos
  addDiscipline = async (req: AuthRequest, res: Response): Promise<Response> => {
    const courseRepository = AppDataSource.getRepository(Course);
    const disciplineRepository = AppDataSource.getRepository(Discipline);
    
    try {
      const { id } = req.params;
      const { disciplineIds } = req.body;

      const course = await courseRepository.findOne({ 
        where: { id },
        relations: ['disciplines']
      });
      
      if (!course) {
        return res.status(404).json({ error: 'Curso não encontrado' });
      }

      const disciplines = await disciplineRepository.findByIds(disciplineIds);
      course.disciplines = [...course.disciplines, ...disciplines];

      const updatedCourse = await courseRepository.save(course);
      return res.json({ 
        message: 'Disciplinas vinculadas ao curso com sucesso',
        course: updatedCourse 
      });
    } catch (error: any) {
      console.error('Erro ao vincular disciplinas:', error);
      return res.status(500).json({ error: error.message || 'Erro ao vincular disciplinas' });
    }
  }
}


