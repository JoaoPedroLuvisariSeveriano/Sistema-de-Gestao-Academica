import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Student } from './entities/Student';
import { Teacher } from './entities/Teacher';
import { Course } from './entities/Course';
import { Discipline } from './entities/Discipline';
import { Enrollment } from './entities/Enrollment';
import { DisciplineEnrollment } from './entities/DisciplineEnrollment';
import { Grade } from './entities/Grade';
import { AcademicHistory } from './entities/AcademicHistory';
import { AuditLog } from './entities/AuditLog';
import { User } from './entities/User';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME || 'gestao_academica';

// First, connect to postgres to create the database if it doesn't exist
const postgresDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres',
});

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: dbName,
  synchronize: true,
  logging: true,
  entities: [
    Student,
    Teacher,
    Course,
    Discipline,
    Enrollment,
    DisciplineEnrollment,
    Grade,
    AcademicHistory,
    AuditLog,
    User,
  ],
});

// Função para migrar o enum de modality ANTES da sincronização
async function migrateModalityEnum() {
  console.log('🔄 Verificando migração do enum modality...');
  
  try {
    // Conectar temporariamente para verificar/migrar o enum
    const tempDataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: dbName,
    });

    await tempDataSource.initialize();

    // Verificar se a tabela courses existe
    const tableExists = await tempDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'courses'
      );
    `);

    if (!tableExists[0].exists) {
      console.log('ℹ️  Tabela courses não existe ainda. Pulando migração.');
      await tempDataSource.destroy();
      return;
    }

    // Verificar se a coluna modality existe e é do tipo enum
    const columnInfo = await tempDataSource.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'courses' AND column_name = 'modality';
    `);

    if (columnInfo.length === 0 || columnInfo[0].data_type !== 'USER-DEFINED') {
      console.log('ℹ️  Coluna modality não é enum ou não existe. Pulando migração.');
      await tempDataSource.destroy();
      return;
    }

    // Verificar valores atuais do enum
    const enumValues = await tempDataSource.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'courses_modality_enum')
      ORDER BY enumsortorder;
    `);

    const currentValues = enumValues.map((e: any) => e.enumlabel);
    console.log('📋 Valores atuais do enum:', currentValues);

    // Mapear conversão de valores antigos para novos
    const conversionMap: Record<string, string> = {
      'presencial': 'Presencial',
      'ead': 'EAD',
      'hibrido': 'Híbrido',
    };

    // Adicionar novos valores ao enum
    console.log('🔄 Adicionando novos valores ao enum...');
    
    for (const newValue of ['Presencial', 'EAD', 'Híbrido']) {
      try {
        // Tentar adicionar (ignorar se já existir)
        await tempDataSource.query(
          `ALTER TYPE courses_modality_enum ADD VALUE $1;`,
          [newValue]
        );
        console.log(`   ✓ Adicionado: ${newValue}`);
      } catch (err: any) {
        if (err.message.includes('already exists')) {
          console.log(`   ℹ️  ${newValue} já existe`);
        } else if (err.message.includes('IF NOT EXISTS')) {
          // Versão mais antiga do PostgreSQL, tenta SELECT para verificar
          console.log(`   ℹ️  Verificando ${newValue}...`);
        }
      }
    }

    // Converter registros existentes
    console.log('🔄 Convertendo registros existentes...');
    
    for (const [oldValue, newValue] of Object.entries(conversionMap)) {
      const result = await tempDataSource.query(
        `UPDATE courses SET modality = $1 WHERE modality = $2 RETURNING id, name;`,
        [newValue, oldValue]
      );
      
      if (result.length > 0) {
        console.log(`   ✓ Convertido(s) ${result.length} registro(s) de '${oldValue}' para '${newValue}'`);
      }
    }

    // Verificar valores finais
    const finalEnumValues = await tempDataSource.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'courses_modality_enum')
      ORDER BY enumsortorder;
    `);

    console.log('📋 Valores finais do enum:', finalEnumValues.map((e: any) => e.enumlabel));
    console.log('✅ Migração do enum concluída!');

    await tempDataSource.destroy();
  } catch (error: any) {
    console.error('⚠️  Erro na migração do enum (continuando mesmo assim):', error.message);
  }
}

async function createDatabaseIfNotExists() {
  try {
    await postgresDataSource.initialize();
    console.log('✅ Conectado ao PostgreSQL!');
    
    // Check if database exists
    const result = await postgresDataSource.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    
    if (result.length === 0) {
      console.log(`🔄 Criando banco de dados '${dbName}'...`);
      await postgresDataSource.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Banco de dados '${dbName}' criado!`);
    } else {
      console.log(`ℹ️  Banco de dados '${dbName}' já existe`);
    }
    
    await postgresDataSource.destroy();
  } catch (error: any) {
    console.error('❌ Erro ao verificar/criar banco:', error.message);
    // Continue anyway - maybe it already exists
  }
}

async function syncDatabase() {
  try {
    await createDatabaseIfNotExists();
    
    // ANTES de sincronizar, fazer a migração do enum
    await migrateModalityEnum();
    
    console.log('🔄 Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('✅ Banco de dados conectado!');
    
    console.log('🔄 Sincronizando entidades...');
    await AppDataSource.synchronize();
    console.log('✅ Tabelas criadas com sucesso!');
    
    // Use query method from data source instead of queryRunner
    const tables = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Tabelas no banco:', tables.map((t: any) => t.table_name).join(', '));
    
    await AppDataSource.destroy();
    console.log('✅ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

syncDatabase();
