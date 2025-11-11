import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AggregateModule } from "./aggregate/aggregate.module";
import { EventHandlersModule } from "./event-handlers/event-handlers.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    EventHandlersModule,
    AggregateModule,
  ],
})
export class AppModule {}
