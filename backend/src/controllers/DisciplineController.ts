
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Discipline, DisciplineStatus } from '../entities/Discipline';
import { AuthRequest } from '../middleware/auth';

export class DisciplineController {
  // RF#14 - Cadastro de disciplinas
  create = async (req: AuthRequest, res: Response): Promise<Response> => {
    const disciplineRepository = AppDataSource.getRepository(Discipline);
    
    try {
      const { name, description, ementa, workload, credits, period, courseId, prerequisiteIds } = req.body;

      // Validar campos obrigatórios
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Nome da disciplina é obrigatório' });
      }
      if (!courseId) {
        return res.status(400).json({ error: 'ID do curso é obrigatório' });
      }

      const discipline = disciplineRepository.create({
        name: name.trim(),
        description: description || '',
        ementa: ementa || '',
        workload: workload || 0,
        credits: credits || 0,
        period: period || 1,
        courseId,
        prerequisiteIds: prerequisiteIds || [],
        status: DisciplineStatus.ACTIVE,
      });

      const savedDiscipline = await disciplineRepository.save(discipline);
      return res.status(201).json(savedDiscipline);
    } catch (error: any) {
      console.error('Erro ao criar disciplina:', error);
      return res.status(500).json({ error: error.message || 'Erro ao criar disciplina' });
    }
  }

  // Consulta de disciplinas
  findAll = async (req: AuthRequest, res: Response): Promise<Response> => {
    const disciplineRepository = AppDataSource.getRepository(Discipline);
    
    try {
      const { name, courseId, status, period } = req.query;

      const query = disciplineRepository.createQueryBuilder('discipline')
        .leftJoinAndSelect('discipline.course', 'course');

      if (name) {
        query.andWhere('discipline.name ILIKE :name', { name: `%${name}%` });
      }
      if (courseId) {
        query.andWhere('discipline.courseId = :courseId', { courseId });
      }
      if (status) {
        query.andWhere('discipline.status = :status', { status });
      }
      if (period) {
        query.andWhere('discipline.period = :period', { period });
      }

      const disciplines = await query.getMany();
      return res.json(disciplines);
    } catch (error: any) {
      console.error('Erro ao buscar disciplinas:', error);
      return res.status(500).json({ error: error.message || 'Erro ao buscar disciplinas' });
    }
  }

  findById = async (req: AuthRequest, res: Response): Promise<Response> => {
    const disciplineRepository = AppDataSource.getRepository(Discipline);
    
    try {
      const { id } = req.params;
      const discipline = await disciplineRepository.findOne({
        where: { id },
        relations: ['course'],
      });

      if (!discipline) {
        return res.status(404).json({ error: 'Disciplina não encontrada' });
      }

      return res.json(discipline);
    } catch (error: any) {
      console.error('Erro ao buscar disciplina:', error);
      return res.status(500).json({ error: error.message || 'Erro ao buscar disciplina' });
    }
  }

  // Get disciplines by course
  findByCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
    const disciplineRepository = AppDataSource.getRepository(Discipline);
    
    try {
      const { courseId } = req.params;
      
      const disciplines = await disciplineRepository.find({
        where: { courseId, status: DisciplineStatus.ACTIVE },
        order: { period: 'ASC', name: 'ASC' },
      });

      return res.json(disciplines);
    } catch (error: any) {
      console.error('Erro ao buscar disciplinas do curso:', error);
      return res.status(500).json({ error: error.message || 'Erro ao buscar disciplinas do curso' });
    }
  }

  // RF#15 - Definição de carga horária, RF#16 - Pré-requisitos, RF#17 - Vinculação ao curso
  update = async (req: AuthRequest, res: Response): Promise<Response> => {
    const disciplineRepository = AppDataSource.getRepository(Discipline);
    
    try {
      const { id } = req.params;
      const { name, description, ementa, workload, credits, period, courseId, prerequisiteIds, status } = req.body;

      const discipline = await disciplineRepository.findOne({ where: { id } });
      if (!discipline) {
        return res.status(404).json({ error: 'Disciplina não encontrada' });
      }

      if (name) discipline.name = name;
      if (description) discipline.description = description;
      if (ementa) discipline.ementa = ementa;
      if (workload) discipline.workload = workload;
      if (credits) discipline.credits = credits;
      if (period) discipline.period = period;
      if (courseId) discipline.courseId = courseId;
      if (prerequisiteIds) discipline.prerequisiteIds = prerequisiteIds;
      if (status) discipline.status = status;

      const updatedDiscipline = await disciplineRepository.save(discipline);
      return res.json(updatedDiscipline);
    } catch (error: any) {
      console.error('Erro ao atualizar disciplina:', error);
      return res.status(500).json({ error: error.message || 'Erro ao atualizar disciplina' });
    }
  }
}


