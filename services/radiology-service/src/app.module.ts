import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RadiologyOrdersModule } from './radiology-orders/radiology-orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RadiologyOrdersModule,
  ],
})
export class AppModule {}
