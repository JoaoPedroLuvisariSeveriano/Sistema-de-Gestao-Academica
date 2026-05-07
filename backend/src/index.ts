import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';

// Carregar variáveis de ambiente
dotenv.config();

// Configurações CORS
const corsOptions: cors.CorsOptions = {
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type', 'Content-Length', 'Content-Disposition'],
  credentials: true,
  maxAge: 86400,
};

// Importar rotas
import studentRoutes from './routes/student.routes';
import teacherRoutes from './routes/teacher.routes';
import courseRoutes from './routes/course.routes';
import disciplineRoutes from './routes/discipline.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import gradeRoutes from './routes/grade.routes';
import documentRoutes from './routes/document.routes';
import authRoutes from './routes/auth.routes';
import debugRoutes from './routes/debug.routes';

// Configurações
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ type: '*/*' }));
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/disciplines', disciplineRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', debugRoutes);

// Health check and root API route
app.get('/api', (req: Request, res: Response) => {
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

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Sistema de Gestão Acadêmica está funcionando!' });
});

// Middleware de tratamento de erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Erro:', err.message);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Iniciar servidor
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📚 API disponível em: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();

export default app;

