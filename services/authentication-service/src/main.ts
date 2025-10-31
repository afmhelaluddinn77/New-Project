import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

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
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
  
  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  
  await app.listen(3000)
  console.log('Authentication Service running on port 3000')
}
bootstrap()

