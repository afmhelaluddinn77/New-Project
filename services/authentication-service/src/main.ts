import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
const csurf = require("csurf");
const cookieParser = require("cookie-parser");

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all frontend portals (reflect requesting origin)
  app.enableCors({
    origin: true, // reflect the Origin header so Access-Control-Allow-Origin is always set
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-XSRF-TOKEN",
      "x-user-role",
      "x-user-id",
      "x-portal",
      "Accept",
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use(cookieParser());
  // Apply CSRF protection, but SKIP it for /auth/login, /auth/refresh, and /auth/register
  app.use((req: any, res: any, next: any) => {
    if (
      req.path === "/api/auth/login" ||
      req.path === "/api/auth/refresh" ||
      req.path === "/api/auth/register"
    ) {
      return next(); // Skip CSRF for login, refresh, and register endpoints
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
