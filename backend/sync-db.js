require('dotenv').config();
const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'gestao_academica',
  synchronize: true,
  logging: true,
  entities: [
    require('./src/entities/Student').Student,
    require('./src/entities/Teacher').Teacher,
    require('./src/entities/Course').Course,
    require('./src/entities/Discipline').Discipline,
    require('./src/entities/Enrollment').Enrollment,
    require('./src/entities/DisciplineEnrollment').DisciplineEnrollment,
    require('./src/entities/Grade').Grade,
    require('./src/entities/AcademicHistory').AcademicHistory,
    require('./src/entities/AuditLog').AuditLog,
    require('./src/entities/User').User,
  ],
});

async function syncDatabase() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('✅ Banco de dados conectado!');
    
    console.log('🔄 Sincronizando entidades...');
    await AppDataSource.synchronize();
    console.log('✅ Tabelas criadas com sucesso!');
    
    const queryRunner = AppDataSource.driver.createQueryRunner();
    await queryRunner.connect();
    const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Tabelas no banco:', tables.map(t => t.table_name).join(', '));
    
    await queryRunner.release();
    await AppDataSource.destroy();
    console.log('✅ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

syncDatabase();
