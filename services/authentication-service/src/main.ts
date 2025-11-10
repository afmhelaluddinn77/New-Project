import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import * as csurf from 'csurf'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  // Enable CORS for all frontend portals
  app.enableCors({
    origin: [
      'http://localhost:5172', // common-portal
      'http://localhost:5173', // patient-portal
      'http://localhost:5174', // provider-portal
      'http://localhost:5175', // admin-portal
      'http://localhost:5176', // lab-portal
      'http://localhost:5177', // pharmacy-portal
      'http://localhost:5178', // billing-portal
      'http://localhost:5179', // radiology-portal
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
    credentials: true,
  })
  
  app.use(cookieParser())
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      },
    }),
  )

  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  
  const port = parseInt(process.env.PORT || '3001', 10)
  await app.listen(port, '0.0.0.0')
  console.log(`Authentication Service running on port ${port}`)
}
bootstrap()

