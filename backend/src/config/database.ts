import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Student } from '../entities/Student';
import { Teacher } from '../entities/Teacher';
import { Course } from '../entities/Course';
import { Discipline } from '../entities/Discipline';
import { Enrollment } from '../entities/Enrollment';
import { DisciplineEnrollment } from '../entities/DisciplineEnrollment';
import { Grade } from '../entities/Grade';
import { AcademicHistory } from '../entities/AcademicHistory';
import { AuditLog } from '../entities/AuditLog';
import { User } from '../entities/User';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'gestao_academica',
  synchronize: true, // Set to false in production
  logging: process.env.NODE_ENV === 'development',
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
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});

// Função para migrar o enum de modality ANTES da sincronização
async function migrateModalityEnum() {
  console.log('🔄 Verificando migração do enum modality...');
  
  const dbName = process.env.DB_NAME || 'gestao_academica';
  
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

    // Verificar se a coluna modality existe
    const columnInfo = await tempDataSource.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'courses' AND column_name = 'modality';
    `);

    // Se a coluna não existe, não precisa migrar
    if (columnInfo.length === 0) {
      console.log('ℹ️  Coluna modality não existe. Pulando migração.');
      await tempDataSource.destroy();
      return;
    }

    // Se a coluna é do tipo texto (foi convertida anteriormente), precisamos converter para enum
    if (columnInfo[0].data_type === 'text') {
      console.log('🔄 Coluna modality está como TEXT (conversão anterior incompleta). Convertendo para enum...');
      
      // Primeiro, verificar se há registros na tabela
      const coursesCheck = await tempDataSource.query(`SELECT id, modality FROM courses;`);
      console.log('📋 Dados atuais nos cursos:', coursesCheck.map((c: any) => `${c.name || c.id}: ${c.modality}`));
      
      // Atualizar os valores para maiúsculo (se ainda não foram)
      console.log('🔄 Convertendo valores para maiúsculo...');
      await tempDataSource.query(`UPDATE courses SET modality = 'Presencial' WHERE modality = 'presencial';`);
      await tempDataSource.query(`UPDATE courses SET modality = 'EAD' WHERE modality = 'ead';`);
      await tempDataSource.query(`UPDATE courses SET modality = 'Híbrido' WHERE modality = 'hibrido';`);
      console.log('   ✓ Valores atualizados');

      // Remover o tipo de enum antigo com CASCADE (força a remoção)
      console.log('🔄 Removendo tipo de enum antigo...');
      try {
        await tempDataSource.query(`DROP TYPE IF EXISTS courses_modality_enum CASCADE;`);
        console.log('   ✓ Tipo antigo removido (com CASCADE)');
      } catch (dropErr: any) {
        console.log('   ℹ️  Tipo não existe ou já foi removido');
      }

      // Criar novo tipo de enum com os novos valores
      console.log('🔄 Criando novo tipo de enum...');
      try {
        await tempDataSource.query(`
          CREATE TYPE courses_modality_enum AS ENUM ('Presencial', 'EAD', 'Híbrido');
        `);
        console.log('   ✓ Tipo enum criado');
      } catch (createErr: any) {
        console.log('   ⚠️  Erro ao criar tipo:', createErr.message);
      }

      // Converter a coluna para enum
      console.log('🔄 Convertendo coluna para enum...');
      try {
        await tempDataSource.query(`ALTER TABLE courses ALTER COLUMN modality TYPE courses_modality_enum;`);
        console.log('   ✓ Coluna convertida para enum');
      } catch (convErr: any) {
        console.log('   ⚠️  Erro na conversão:', convErr.message);
        // Tentar com USING clause explícita
        try {
          await tempDataSource.query(`ALTER TABLE courses ALTER COLUMN modality TYPE courses_modality_enum USING modality::text::courses_modality_enum;`);
          console.log('   ✓ Coluna convertida para enum (com USING)');
        } catch (usingErr: any) {
          console.log('   ⚠️  Erro com USING:', usingErr.message);
        }
      }
      
      console.log('✅ Migração da coluna TEXT para enum concluída!');
      await tempDataSource.destroy();
      return;
    }

    // Se a coluna é do tipo enum
    if (columnInfo[0].data_type !== 'USER-DEFINED') {
      console.log('ℹ️  Coluna modality não é enum. Pulando migração.');
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

    // Verificar se já são os novos valores (em maiúsculo)
    const hasOldValues = currentValues.some((v: string) => ['presencial', 'ead', 'hibrido'].includes(v));
    
    if (!hasOldValues) {
      console.log('ℹ️  Enum já está no formato correto. Pulando migração.');
      await tempDataSource.destroy();
      return;
    }

    // ========== ABORDAGEM CORRETA ==========
    // O problema: o enum tem 'presencial', 'ead', 'hibrido' mas precisamos de 'Presencial', 'EAD', 'Híbrido'
    // Solução: Usar uma coluna temporária e criar novo tipo de enum
    
    console.log('🔄 Iniciando migração completa do enum...');
    
    // Passo 1: Criar novo tipo de enum com os novos valores
    console.log('🔄 Criando novo tipo de enum...');
    try {
      await tempDataSource.query(`
        CREATE TYPE courses_modality_enum_new AS ENUM ('Presencial', 'EAD', 'Híbrido');
      `);
      console.log('   ✓ Novo tipo criado');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        // Se já existe, precisamos deletar e recriar
        await tempDataSource.query(`DROP TYPE IF EXISTS courses_modality_enum_new;`);
        await tempDataSource.query(`
          CREATE TYPE courses_modality_enum_new AS ENUM ('Presencial', 'EAD', 'Híbrido');
        `);
        console.log('   ✓ Novo tipo recriado');
      }
    }

    // Passo 2: Adicionar coluna temporária com o novo tipo
    console.log('🔄 Adicionando coluna temporária...');
    await tempDataSource.query(`
      ALTER TABLE courses ADD COLUMN modality_new courses_modality_enum_new;
    `);
    console.log('   ✓ Coluna temporária adicionada');

    // Passo 3: Copiar dados convertidos para a nova coluna
    console.log('🔄 Copiando dados para coluna temporária...');
    await tempDataSource.query(`
      UPDATE courses SET modality_new = 
        CASE modality::text
          WHEN 'presencial' THEN 'Presencial'::courses_modality_enum_new
          WHEN 'ead' THEN 'EAD'::courses_modality_enum_new
          WHEN 'hibrido' THEN 'Híbrido'::courses_modality_enum_new
          ELSE NULL
        END
    `);
    console.log('   ✓ Dados copiados');

    // Passo 4: Verificar se há dados nulos
    const nullCount = await tempDataSource.query(`SELECT COUNT(*) as cnt FROM courses WHERE modality_new IS NULL AND modality IS NOT NULL;`);
    if (parseInt(nullCount[0].cnt) > 0) {
      console.log(`   ⚠️  ${nullCount[0].cnt} registros não puderam ser convertidos`);
    }

    // Passo 5: Remover coluna antiga e renomear a nova
    console.log('🔄 Substituindo coluna antiga...');
    await tempDataSource.query(`ALTER TABLE courses DROP COLUMN modality;`);
    await tempDataSource.query(`ALTER TABLE courses RENAME COLUMN modality_new TO modality;`);
    console.log('   ✓ Coluna substituída');

    // Passo 6: Remover o tipo de enum antigo
    console.log('🔄 Removendo tipo de enum antigo...');
    await tempDataSource.query(`DROP TYPE IF EXISTS courses_modality_enum;`);
    console.log('   ✓ Tipo antigo removido');

    // Passo 7: Renomear o novo tipo
    console.log('🔄 Renomeando tipo de enum...');
    await tempDataSource.query(`ALTER TYPE courses_modality_enum_new RENAME TO courses_modality_enum;`);
    console.log('   ✓ Tipo renomeado');

    // Verificar valores finais
    const finalEnumValues = await tempDataSource.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'courses_modality_enum')
      ORDER BY enumsortorder;
    `);

    console.log('📋 Valores finais do enum:', finalEnumValues.map((e: any) => e.enumlabel));
    
    // Verificar dados nos cursos
    const courses = await tempDataSource.query(`SELECT id, name, modality FROM courses;`);
    console.log('📋 Cursos:', courses.map((c: any) => `${c.name}: ${c.modality}`));
    
    console.log('✅ Migração do enum concluída!');

    await tempDataSource.destroy();
  } catch (error: any) {
    console.error('⚠️  Erro na migração do enum:', error.message);
    // Não falha o servidor - deixa o TypeORM tentar
  }
}

// Função para conectar ao banco de dados
export async function initializeDatabase(): Promise<void> {
  try {
    // Primeiro, fazer a migração do enum ANTES de inicializar o TypeORM
    await migrateModalityEnum();
    
    await AppDataSource.initialize();
    console.log('✅ Banco de dados conectado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    throw error;
  }
}

