const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkUsers() {
  console.log("Checking users in database...\n");

  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      portal: true,
      firstName: true,
      lastName: true,
    },
  });

  if (users.length === 0) {
    console.log("❌ No users found in database!");
  } else {
    console.log(`Found ${users.length} users:\n`);
    users.forEach((user) => {
      console.log(`Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Portal: ${user.portal}`);
      console.log(`  Name: ${user.firstName} ${user.lastName}`);
      console.log("");
    });
  }

  await prisma.$disconnect();
}

checkUsers().catch(console.error);
