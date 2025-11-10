import { hash } from "bcrypt";
import { randomUUID } from "crypto";

/**
 * Test user fixtures for E2E testing
 * Run with: npm run seed:test-users
 */

export const testUsers = [
  {
    id: randomUUID(),
    email: "test-doctor@hospital.com",
    password: "TestPassword123!",
    role: "doctor",
  },
  {
    id: randomUUID(),
    email: "test-nurse@hospital.com",
    password: "TestPassword123!",
    role: "nurse",
  },
  {
    id: randomUUID(),
    email: "test-admin@hospital.com",
    password: "TestPassword123!",
    role: "admin",
  },
];

export async function seedTestUsers(userRepository: any) {
  console.log("🌱 Seeding test users...");

  for (const userData of testUsers) {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`⚠️  User ${userData.email} already exists, skipping...`);
      continue;
    }

    const hashedPassword = await hash(userData.password, 10);

    const user = userRepository.create({
      id: userData.id,
      email: userData.email,
      role: userData.role,
      hashedRefreshToken: hashedPassword, // Store password hash here temporarily
    });

    await userRepository.save(user);
    console.log(`✅ Created test user: ${userData.email}`);
  }

  console.log("🎉 Test users seeded successfully!");
  console.log("\nTest Credentials:");
  testUsers.forEach((user) => {
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${user.password}`);
    console.log(`  Role: ${user.role}\n`);
  });
}
