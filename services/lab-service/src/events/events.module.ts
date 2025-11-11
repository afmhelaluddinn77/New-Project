import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { LabEventPublisher } from './lab-event.publisher';

/**
 * Events Module - Lab Service
 *
 * MANDATORY: NATS client for event publishing
 * Complies with: Development Law (event-driven architecture)
 */
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'NATS_CLIENT',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.NATS,
          options: {
            servers: [config.get('NATS_URL', 'nats://localhost:4222')],
            // NATS JetStream configuration
            queue: 'lab-service',
            // Retry configuration
            maxReconnectAttempts: 10,
            reconnectTimeWait: 2000,
          },
        }),
      },
    ]),
  ],
  providers: [LabEventPublisher],
  exports: [LabEventPublisher],
})
export class EventsModule {}
