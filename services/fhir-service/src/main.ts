import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow frontend portals to call FHIR APIs directly in development
  app.enableCors({
    origin: [
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

  // All routes in this service will be under the /fhir prefix
  app.setGlobalPrefix("fhir");

  const port = parseInt(process.env.PORT || "3022", 10);
  await app.listen(port, "0.0.0.0");
  // eslint-disable-next-line no-console
  console.log(`FHIR Service HTTP API running on port ${port}`);
}

bootstrap();
