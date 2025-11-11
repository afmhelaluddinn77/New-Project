import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { EventHandlersModule } from "./event-handlers/event-handlers.module";
import { NotificationGateway } from "./websocket/notification.gateway";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key-here",
      signOptions: { expiresIn: "24h" },
    }),
    EventHandlersModule,
  ],
  providers: [NotificationGateway],
})
export class AppModule {}
