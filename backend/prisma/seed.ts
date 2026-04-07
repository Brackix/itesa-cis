import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial admin user...');
  
  const passwordHash = await bcrypt.hash('admin123', 12);
  
  await prisma.users.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      id: uuidv4(),
      username: 'admin',
      password_hash: passwordHash,
      role: 'brackix',
    },
  });

  console.log('Admin user seeded! Username: admin, Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
