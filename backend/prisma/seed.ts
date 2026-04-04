import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

async function main() {
  console.log('Seeding sections...');
  for (const section of SECTIONS) {
    await prisma.sections.upsert({
      where: { name: section },
      update: {},
      create: {
        name: section
      }
    });
  }
  console.log('Sections seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
