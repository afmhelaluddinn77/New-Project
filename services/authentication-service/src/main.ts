import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
const csurf = require("csurf");
const cookieParser = require("cookie-parser");

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all frontend portals
  app.enableCors({
    origin: [
      "http://localhost:5172", // common-portal
      "http://localhost:5173", // admin-portal
      "http://localhost:5174", // provider-portal
      "http://localhost:5175", // patient-portal
      "http://localhost:5176", // lab-portal
      "http://localhost:5177", // pharmacy-portal
      "http://localhost:5178", // billing-portal
      "http://localhost:5179", // radiology-portal
      "http://localhost:5180", // common-portal
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-XSRF-TOKEN",
      "x-user-role",
      "x-user-id",
      "x-portal",
    ],
    credentials: true,
  });

  app.use(cookieParser());
  // Apply CSRF protection, but SKIP it for /auth/login and /auth/refresh
  app.use((req: any, res: any, next: any) => {
    if (req.path === '/api/auth/login' || req.path === '/api/auth/refresh') {
      return next(); // Skip CSRF for login and refresh endpoints
    }
    csurf({
      cookie: {
        httpOnly: true,
        sameSite: "lax", // Use 'lax' for development across different ports
        secure: process.env.NODE_ENV === "production",
      },
    })(req, res, next);
  });

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const port = parseInt(process.env.PORT || "3001", 10);
  await app.listen(port, "0.0.0.0");
  console.log(`Authentication Service running on port ${port}`);
}
bootstrap();
