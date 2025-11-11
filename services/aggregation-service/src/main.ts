import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";

async function bootstrap() {
  // Create HTTP server
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend portals
  app.enableCors({
    origin: [
      "http://localhost:5172",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:5177",
      "http://localhost:5178",
      "http://localhost:5179",
      "http://localhost:5180",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-user-role",
      "x-user-id",
      "x-portal",
      "X-XSRF-TOKEN",
    ],
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Connect to NATS microservice for event consumption
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || "nats://localhost:4222"],
      queue: "aggregation-service-queue", // Load balancing across instances
    },
  });

  await app.startAllMicroservices();
  await app.listen(3020);

  console.log("🚀 Aggregation Service running on port 3020");
  console.log("📡 Connected to NATS event bus");
}

bootstrap();
