const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding users...');

  const users = [
    {
      email: 'provider@example.com',
      password: 'password123',
      firstName: 'Dr. John',
      lastName: 'Smith',
      role: 'PROVIDER',
      portal: 'PROVIDER',
    },
    {
      email: 'pharmacist@example.com',
      password: 'password123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'PHARMACIST',
      portal: 'PHARMACY',
    },
    {
      email: 'radiologist@example.com',
      password: 'password123',
      firstName: 'Dr. Michael',
      lastName: 'Chen',
      role: 'RADIOLOGIST',
      portal: 'RADIOLOGY',
    },
    {
      email: 'labtech@example.com',
      password: 'password123',
      firstName: 'Emily',
      lastName: 'Davis',
      role: 'LAB_TECH',
      portal: 'LAB',
    },
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        portal: userData.portal,
      },
      create: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        portal: userData.portal,
      },
    });

    console.log(`✅ Created/Updated user: ${user.email} (${user.role})`);
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

