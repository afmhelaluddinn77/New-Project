import { NestFactory } from "@nestjs/core";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AppModule } from "../app.module";
import { User } from "../auth/user.entity";
import { seedTestUsers } from "../test-fixtures/test-users";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userRepository = app.get(getRepositoryToken(User));
    await seedTestUsers(userRepository);
  } catch (error) {
    console.error("❌ Error seeding test users:", error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
