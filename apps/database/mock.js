const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { config } = require('dotenv');

config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
  // Mock Users
  const users = [
    {
      username: 'user1',
      password: await bcrypt.hash('password', 10),
      name: 'Test User 1',
      role: Role.USER,
    },
    {
      username: 'admin',
      password: await bcrypt.hash('admin', 10),
      name: 'Admin User',
      role: Role.ADMIN,
    },
  ];

  await prisma.user.createMany({ data: users });
}

main()
  .then(async () => {
    console.log('Mock data seeded successfully!');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
