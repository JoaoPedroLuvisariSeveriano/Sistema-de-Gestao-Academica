"use strict";
/**
 * Script de Migração para corrigir o enum courses_modality_enum
 *
 * Problema: O banco tem valores antigos (presencial, ead, hibrido) em minúsculo
 * mas o código espera (Presencial, EAD, Híbrido) com iniciais maiúsculas
 *
 * Solução: Adicionar novos valores ao enum, converter registros, e remover antigos
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbName = process.env.DB_NAME || 'gestao_academica';
const migrationDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: dbName,
});
async function migrateModalityEnum() {
    console.log('🔄 Iniciando migração do enum modality...\n');
    try {
        await migrationDataSource.initialize();
        console.log('✅ Conectado ao banco de dados');
        // Verificar se a tabela courses existe
        const tableExists = await migrationDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'courses'
      );
    `);
        if (!tableExists[0].exists) {
            console.log('ℹ️  Tabela courses não existe ainda. Migração não necessária.');
            await migrationDataSource.destroy();
            process.exit(0);
        }
        // Verificar o tipo atual do enum
        const enumType = await migrationDataSource.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'courses_modality_enum')
      ORDER BY enumsortorder;
    `);
        console.log('📋 Valores atuais do enum:', enumType.map((e) => e.enumlabel));
        // Mapear conversão de valores antigos para novos
        const conversionMap = {
            'presencial': 'Presencial',
            'ead': 'EAD',
            'hibrido': 'Híbrido',
        };
        // Adicionar novos valores ao enum (PostgreSQL permite adicionar sem remover os antigos)
        console.log('\n🔄 Adicionando novos valores ao enum...');
        for (const newValue of ['Presencial', 'EAD', 'Híbrido']) {
            try {
                await migrationDataSource.query(`ALTER TYPE courses_modality_enum ADD VALUE IF NOT EXISTS $1;`, [newValue]);
                console.log(`   ✓ Adicionado: ${newValue}`);
            }
            catch (err) {
                // IF NOT EXISTS pode não existir em versões antigas, ignoramos erro
                if (!err.message.includes('already exists')) {
                    console.log(`   ℹ️  ${newValue} (pode já existir)`);
                }
            }
        }
        // Converter registros existentes
        console.log('\n🔄 Convertendo registros existentes...');
        for (const [oldValue, newValue] of Object.entries(conversionMap)) {
            const result = await migrationDataSource.query(`UPDATE courses SET modality = $1 WHERE modality = $2 RETURNING id, name;`, [newValue, oldValue]);
            if (result.length > 0) {
                console.log(`   ✓ Convertido(s) ${result.length} registro(s) de '${oldValue}' para '${newValue}'`);
                result.forEach((r) => console.log(`      - ${r.name} (${r.id})`));
            }
        }
        // Verificar se há valores antigos restantes
        const remainingOld = await migrationDataSource.query(`
      SELECT DISTINCT modality FROM courses 
      WHERE modality IN ('presencial', 'ead', 'hibrido');
    `);
        if (remainingOld.length > 0) {
            console.log('\n⚠️  Valores antigos restantes:', remainingOld.map((r) => r.modality));
        }
        else {
            console.log('\n✅ Todos os registros foram convertidos para os novos valores!');
        }
        // Verificar valores finais do enum
        const finalEnumType = await migrationDataSource.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'courses_modality_enum')
      ORDER BY enumsortorder;
    `);
        console.log('\n📋 Valores finais do enum:', finalEnumType.map((e) => e.enumlabel));
        // Verificar registros na tabela
        const courses = await migrationDataSource.query(`
      SELECT id, name, modality FROM courses;
    `);
        console.log('\n📋 Cursos no banco:');
        courses.forEach((c) => console.log(`   - ${c.name}: ${c.modality}`));
        await migrationDataSource.destroy();
        console.log('\n✅ Migração concluída com sucesso!');
        process.exit(0);
    }
    catch (error) {
        console.error('\n❌ Erro durante a migração:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
        await migrationDataSource.destroy();
        process.exit(1);
    }
}
// Executar a migração
migrateModalityEnum();
//# sourceMappingURL=migrate-modality-enum.js.map