"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoSeed = autoSeed;
require("reflect-metadata");
const database_1 = require("./config/database");
const User_1 = require("./entities/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function autoSeed() {
    try {
        console.log('🔄 Verificando usuários padrão...');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // Create admin if not exists
        const adminExists = await userRepository.findOne({
            where: { email: 'admin@gestao.com' }
        });
        if (!adminExists) {
            const hashedPassword = await bcryptjs_1.default.hash('admin123', 10);
            const admin = userRepository.create({
                email: 'admin@gestao.com',
                password: hashedPassword,
                role: User_1.UserRole.ADMIN,
                isActive: true,
            });
            await userRepository.save(admin);
            console.log('✅ Usuário admin criado: admin@gestao.com / admin123');
        }
        else {
            console.log('ℹ️  Usuário admin já existe');
        }
        // Create secretary if not exists
        const secretaryExists = await userRepository.findOne({
            where: { email: 'secretaria@gestao.com' }
        });
        if (!secretaryExists) {
            const hashedPassword = await bcryptjs_1.default.hash('123', 10);
            const secretary = userRepository.create({
                email: 'secretaria@gestao.com',
                password: hashedPassword,
                role: User_1.UserRole.SECRETARY,
                isActive: true,
            });
            await userRepository.save(secretary);
            console.log('✅ Usuário secretária criado: secretaria@gestao.com / 123');
        }
        else {
            console.log('ℹ️  Usuário secretária já existe');
        }
        console.log('✅ Auto-seed concluído!');
    }
    catch (error) {
        console.error('❌ Erro no auto-seed:', error);
    }
}
//# sourceMappingURL=auto-seed.js.map