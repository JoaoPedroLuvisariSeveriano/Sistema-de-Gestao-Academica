import 'reflect-metadata';
import { AppDataSource } from './config/database';
import { User, UserRole } from './entities/User';
import bcrypt from 'bcryptjs';

export async function autoSeed(): Promise<void> {
  try {
    console.log('🔄 Verificando usuários padrão...');
    
    const userRepository = AppDataSource.getRepository(User);

    // Create admin if not exists
    const adminExists = await userRepository.findOne({ 
      where: { email: 'admin@gestao.com' } 
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = userRepository.create({
        email: 'admin@gestao.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      });
      await userRepository.save(admin);
      console.log('✅ Usuário admin criado: admin@gestao.com / admin123');
    } else {
      console.log('ℹ️  Usuário admin já existe');
    }

    // Create secretary if not exists
    const secretaryExists = await userRepository.findOne({ 
      where: { email: 'secretaria@gestao.com' } 
    });

    if (!secretaryExists) {
      const hashedPassword = await bcrypt.hash('123', 10);
      const secretary = userRepository.create({
        email: 'secretaria@gestao.com',
        password: hashedPassword,
        role: UserRole.SECRETARY,
        isActive: true,
      });
      await userRepository.save(secretary);
      console.log('✅ Usuário secretária criado: secretaria@gestao.com / 123');
    } else {
      console.log('ℹ️  Usuário secretária já existe');
    }

    console.log('✅ Auto-seed concluído!');
  } catch (error) {
    console.error('❌ Erro no auto-seed:', error);
  }
}
