import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany();
  console.log('Users in DB:', users.map(u => ({ id: u.id, username: u.username, role: u.role })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
