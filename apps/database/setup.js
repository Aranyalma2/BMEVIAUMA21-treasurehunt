const { PrismaClient, Role} = require('@prisma/client');
const bcrypt = require('bcrypt');
const { config } = require('dotenv');

config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (in reverse order of dependencies)
  await prisma.completedMission.deleteMany({});
  await prisma.multiChoiceAnswer.deleteMany({});
  await prisma.simpleQuestionTask.deleteMany({});
  await prisma.multiChoiceTask.deleteMany({});
  await prisma.trueOrFalseTask.deleteMany({});
  await prisma.mission.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared existing data');

  await prisma.user.create({
      data: {
        username: 'admin',
        password: await bcrypt.hash('password', 10),
        name: 'Admin',
        role: Role.ADMIN,
      },
    });
}

main()
  .then(async () => {
    console.log('Setup data seeded successfully!');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


