"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
// Carregar variáveis de ambiente
dotenv_1.default.config();
// Importar rotas
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const teacher_routes_1 = __importDefault(require("./routes/teacher.routes"));
const course_routes_1 = __importDefault(require("./routes/course.routes"));
const discipline_routes_1 = __importDefault(require("./routes/discipline.routes"));
const enrollment_routes_1 = __importDefault(require("./routes/enrollment.routes"));
const grade_routes_1 = __importDefault(require("./routes/grade.routes"));
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const debug_routes_1 = __importDefault(require("./routes/debug.routes"));
// Configurações
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Rotas da API
app.use('/api/auth', auth_routes_1.default);
app.use('/api/students', student_routes_1.default);
app.use('/api/teachers', teacher_routes_1.default);
app.use('/api/courses', course_routes_1.default);
app.use('/api/disciplines', discipline_routes_1.default);
app.use('/api/enrollments', enrollment_routes_1.default);
app.use('/api/grades', grade_routes_1.default);
app.use('/api/documents', document_routes_1.default);
app.use('/api', debug_routes_1.default);
// Health check and root API route
app.get('/api', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Sistema de Gestão Acadêmica está funcionando!',
        endpoints: {
            auth: '/api/auth',
            students: '/api/students',
            teachers: '/api/teachers',
            courses: '/api/courses',
            disciplines: '/api/disciplines',
            enrollments: '/api/enrollments',
            grades: '/api/grades',
            documents: '/api/documents',
            health: '/api/health'
        }
    });
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Sistema de Gestão Acadêmica está funcionando!' });
});
// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro:', err.message);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});
// Iniciar servidor
async function startServer() {
    try {
        await (0, database_1.initializeDatabase)();
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📚 API disponível em: http://localhost:${PORT}/api`);
        });
    }
    catch (error) {
        console.error('❌ Falha ao iniciar o servidor:', error);
        process.exit(1);
    }
}
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map