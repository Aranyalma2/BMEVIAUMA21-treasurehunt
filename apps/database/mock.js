const { PrismaClient, Role, Status, TaskType } = require('@prisma/client');
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

  console.log('🗑️  Cleared existing data');

  // Mock Users
  const user1 = await prisma.user.create({
    data: {
      username: 'user1',
      password: await bcrypt.hash('password', 10),
      name: 'Test User 1',
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'user2',
      password: await bcrypt.hash('password', 10),
      name: 'Test User 2',
      role: Role.USER,
    },
  });

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: await bcrypt.hash('admin', 10),
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  console.log('✅ Created users');

  // Mission 1: True or False Task - Approved (BME Building)
  const mission1 = await prisma.mission.create({
    data: {
      name: 'BME Q Building History',
      description: 'Test your knowledge about the iconic BME Q building!',
      longitude: 19.0619,
      latitude: 47.4731,
      status: Status.APPROVED,
      approvedAt: new Date(),
      createdBy: {
        connect: { id: user1.id },
      },
      approvedBy: {
        connect: { id: admin.id },
      },
      task: {
        create: {
          type: TaskType.TRUE_OR_FALSE,
          trueOrFalseTask: {
            create: {
              question: 'The BME Q building was built in the 1990s. True or False?',
              answer: false,
            },
          },
        },
      },
    },
  });

  // Mission 2: Multiple Choice Task - Approved (Hungarian Parliament)
  const mission2 = await prisma.mission.create({
    data: {
      name: 'Parliament Architecture Quiz',
      description: 'Learn about the magnificent Hungarian Parliament Building!',
      longitude: 19.0454,
      latitude: 47.5069,
      status: Status.APPROVED,
      approvedAt: new Date(),
      createdBy: {
        connect: { id: user2.id },
      },
      approvedBy: {
        connect: { id: admin.id },
      },
      task: {
        create: {
          type: TaskType.MULTI_CHOICE,
          multiChoiceTask: {
            create: {
              question: 'In which year was the Hungarian Parliament Building completed?',
              answers: {
                create: [
                  { text: '1885', isTrue: false },
                  { text: '1904', isTrue: true },
                  { text: '1920', isTrue: false },
                  { text: '1945', isTrue: false },
                ],
              },
            },
          },
        },
      },
    },
  });

  // Mission 3: Simple Question Task - Approved (Buda Castle)
  const mission3 = await prisma.mission.create({
    data: {
      name: 'Buda Castle Knowledge',
      description: 'Explore the history of Buda Castle!',
      longitude: 19.0394,
      latitude: 47.4963,
      status: Status.APPROVED,
      approvedAt: new Date(),
      createdBy: {
        connect: { id: user1.id },
      },
      approvedBy: {
        connect: { id: admin.id },
      },
      task: {
        create: {
          type: TaskType.SIMPLE_QUESTION,
          simpleQuestionTask: {
            create: {
              question: 'Which river flows next to Buda Castle?',
              answers: ['Danube', 'danube', 'Duna', 'duna', 'The Danube'],
            },
          },
        },
      },
    },
  });

  // Mission 4: True or False - Approved (Heroes Square)
  const mission4 = await prisma.mission.create({
    data: {
      name: 'Heroes Square Monument',
      description: 'Test your knowledge about Heroes Square!',
      longitude: 19.0773,
      latitude: 47.5149,
      status: Status.APPROVED,
      approvedAt: new Date(),
      createdBy: {
        connect: { id: user2.id },
      },
      approvedBy: {
        connect: { id: admin.id },
      },
      task: {
        create: {
          type: TaskType.TRUE_OR_FALSE,
          trueOrFalseTask: {
            create: {
              question:
                'The Millennium Monument at Heroes Square was built to commemorate the 1000th anniversary of Hungary. True or False?',
              answer: true,
            },
          },
        },
      },
    },
  });

  // Mission 5: Multiple Choice - Approved (Chain Bridge)
  const mission5 = await prisma.mission.create({
    data: {
      name: 'Chain Bridge Trivia',
      description: 'Discover facts about the iconic Chain Bridge!',
      longitude: 19.0436,
      latitude: 47.4985,
      status: Status.APPROVED,
      approvedAt: new Date(),
      createdBy: {
        connect: { id: user1.id },
      },
      approvedBy: {
        connect: { id: admin.id },
      },
      task: {
        create: {
          type: TaskType.MULTI_CHOICE,
          multiChoiceTask: {
            create: {
              question: 'Who designed the Chain Bridge?',
              answers: {
                create: [
                  { text: 'William Tierney Clark', isTrue: true },
                  { text: 'Gustave Eiffel', isTrue: false },
                  { text: 'Miklós Ybl', isTrue: false },
                  { text: 'Imre Steindl', isTrue: false },
                ],
              },
            },
          },
        },
      },
    },
  });

  // Mission 6: Simple Question - Approved (St. Stephen's Basilica)
  const mission6 = await prisma.mission.create({
    data: {
      name: 'Basilica History',
      description: "Learn about St. Stephen's Basilica!",
      longitude: 19.0535,
      latitude: 47.501,
      status: Status.APPROVED,
      approvedAt: new Date(),
      createdBy: {
        connect: { id: user2.id },
      },
      approvedBy: {
        connect: { id: admin.id },
      },
      task: {
        create: {
          type: TaskType.SIMPLE_QUESTION,
          simpleQuestionTask: {
            create: {
              question: 'What is the name of the first king of Hungary, to whom this basilica is dedicated?',
              answers: ['Stephen', 'stephen', 'St. Stephen', 'Saint Stephen', 'István', 'Szent István'],
            },
          },
        },
      },
    },
  });

  // Mission 7: Pending Mission (Fisherman's Bastion)
  const mission7 = await prisma.mission.create({
    data: {
      name: "Fisherman's Bastion View",
      description: "Enjoy the panoramic view from Fisherman's Bastion!",
      longitude: 19.0348,
      latitude: 47.5025,
      status: Status.PENDING,
      createdBy: {
        connect: { id: user1.id },
      },
      task: {
        create: {
          type: TaskType.TRUE_OR_FALSE,
          trueOrFalseTask: {
            create: {
              question:
                "Fisherman's Bastion was named after the fishermen who defended this part of the city walls. True or False?",
              answer: true,
            },
          },
        },
      },
    },
  });

  // Mission 8: Pending Mission (Margaret Island)
  const mission8 = await prisma.mission.create({
    data: {
      name: 'Margaret Island Discovery',
      description: 'Explore the green heart of Budapest!',
      longitude: 19.0502,
      latitude: 47.5273,
      status: Status.PENDING,
      createdBy: {
        connect: { id: user2.id },
      },
      task: {
        create: {
          type: TaskType.MULTI_CHOICE,
          multiChoiceTask: {
            create: {
              question: 'What is the approximate length of Margaret Island?',
              answers: {
                create: [
                  { text: '1.5 km', isTrue: false },
                  { text: '2.5 km', isTrue: true },
                  { text: '3.5 km', isTrue: false },
                  { text: '4.5 km', isTrue: false },
                ],
              },
            },
          },
        },
      },
    },
  });

  // Mission 9: Rejected Mission (Citadella)
  const mission9 = await prisma.mission.create({
    data: {
      name: 'Citadella Fortress',
      description: 'Visit the historic Citadella!',
      longitude: 19.0466,
      latitude: 47.4872,
      status: Status.REJECTED,
      approvedAt: new Date(),
      createdBy: {
        connect: { id: user1.id },
      },
      approvedBy: {
        connect: { id: admin.id },
      },
      task: {
        create: {
          type: TaskType.SIMPLE_QUESTION,
          simpleQuestionTask: {
            create: {
              question: 'In which year was Citadella construction completed?',
              answers: ['1854'],
            },
          },
        },
      },
    },
  });

  console.log('✅ Created missions with various task types');

  // Add some completed missions for leaderboard
  await prisma.completedMission.createMany({
    data: [
      { userId: user1.id, missionId: mission1.id },
      { userId: user1.id, missionId: mission2.id },
      { userId: user1.id, missionId: mission3.id },
      { userId: user1.id, missionId: mission4.id },
      { userId: user2.id, missionId: mission1.id },
      { userId: user2.id, missionId: mission5.id },
      { userId: user2.id, missionId: mission6.id },
    ],
  });

  console.log('✅ Created completed missions for leaderboard');

  console.log('\n📊 Summary:');
  console.log(`   Users: 3 (2 regular users, 1 admin)`);
  console.log(`   Missions: 9 total`);
  console.log(`     - Approved: 6 (2 True/False, 2 Multiple Choice, 2 Simple Question)`);
  console.log(`     - Pending: 2`);
  console.log(`     - Rejected: 1`);
  console.log(`   Completed Missions: 7`);
  console.log('\n👤 Login credentials:');
  console.log('   User 1: username="user1", password="password"');
  console.log('   User 2: username="user2", password="password"');
  console.log('   Admin:  username="admin", password="admin"');
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
