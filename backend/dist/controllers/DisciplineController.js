"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisciplineController = void 0;
const database_1 = require("../config/database");
const Discipline_1 = require("../entities/Discipline");
class DisciplineController {
    constructor() {
        // RF#14 - Cadastro de disciplinas
        this.create = async (req, res) => {
            const disciplineRepository = database_1.AppDataSource.getRepository(Discipline_1.Discipline);
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
                    status: Discipline_1.DisciplineStatus.ACTIVE,
                });
                const savedDiscipline = await disciplineRepository.save(discipline);
                return res.status(201).json(savedDiscipline);
            }
            catch (error) {
                console.error('Erro ao criar disciplina:', error);
                return res.status(500).json({ error: error.message || 'Erro ao criar disciplina' });
            }
        };
        // Consulta de disciplinas
        this.findAll = async (req, res) => {
            const disciplineRepository = database_1.AppDataSource.getRepository(Discipline_1.Discipline);
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
            }
            catch (error) {
                console.error('Erro ao buscar disciplinas:', error);
                return res.status(500).json({ error: error.message || 'Erro ao buscar disciplinas' });
            }
        };
        this.findById = async (req, res) => {
            const disciplineRepository = database_1.AppDataSource.getRepository(Discipline_1.Discipline);
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
            }
            catch (error) {
                console.error('Erro ao buscar disciplina:', error);
                return res.status(500).json({ error: error.message || 'Erro ao buscar disciplina' });
            }
        };
        // Get disciplines by course
        this.findByCourse = async (req, res) => {
            const disciplineRepository = database_1.AppDataSource.getRepository(Discipline_1.Discipline);
            try {
                const { courseId } = req.params;
                const disciplines = await disciplineRepository.find({
                    where: { courseId, status: Discipline_1.DisciplineStatus.ACTIVE },
                    order: { period: 'ASC', name: 'ASC' },
                });
                return res.json(disciplines);
            }
            catch (error) {
                console.error('Erro ao buscar disciplinas do curso:', error);
                return res.status(500).json({ error: error.message || 'Erro ao buscar disciplinas do curso' });
            }
        };
        // RF#15 - Definição de carga horária, RF#16 - Pré-requisitos, RF#17 - Vinculação ao curso
        this.update = async (req, res) => {
            const disciplineRepository = database_1.AppDataSource.getRepository(Discipline_1.Discipline);
            try {
                const { id } = req.params;
                const { name, description, ementa, workload, credits, period, courseId, prerequisiteIds, status } = req.body;
                const discipline = await disciplineRepository.findOne({ where: { id } });
                if (!discipline) {
                    return res.status(404).json({ error: 'Disciplina não encontrada' });
                }
                if (name)
                    discipline.name = name;
                if (description)
                    discipline.description = description;
                if (ementa)
                    discipline.ementa = ementa;
                if (workload)
                    discipline.workload = workload;
                if (credits)
                    discipline.credits = credits;
                if (period)
                    discipline.period = period;
                if (courseId)
                    discipline.courseId = courseId;
                if (prerequisiteIds)
                    discipline.prerequisiteIds = prerequisiteIds;
                if (status)
                    discipline.status = status;
                const updatedDiscipline = await disciplineRepository.save(discipline);
                return res.json(updatedDiscipline);
            }
            catch (error) {
                console.error('Erro ao atualizar disciplina:', error);
                return res.status(500).json({ error: error.message || 'Erro ao atualizar disciplina' });
            }
        };
    }
}
exports.DisciplineController = DisciplineController;
//# sourceMappingURL=DisciplineController.js.map