import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { NotificationGateway } from "../websocket/notification.gateway";
import { LabNotificationHandler } from "./lab-notification.handler";
import { RadiologyNotificationHandler } from "./radiology-notification.handler";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key-here",
      signOptions: { expiresIn: "24h" },
    }),
  ],
  providers: [
    LabNotificationHandler,
    RadiologyNotificationHandler,
    NotificationGateway,
  ],
  exports: [NotificationGateway],
})
export class EventHandlersModule {}
