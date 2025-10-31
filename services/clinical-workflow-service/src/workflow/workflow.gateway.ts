import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

interface OrderUpdatePayload {
  orderId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: false,
  },
  namespace: '/workflow',
})
export class WorkflowGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server!: Server;

  private readonly logger = new Logger(WorkflowGateway.name);

  handleConnection(): void {
    this.logger.debug('Client connected to workflow gateway');
  }

  handleDisconnect(): void {
    this.logger.debug('Client disconnected from workflow gateway');
  }

  emitOrderUpdate(orderId: string): void {
    const payload: OrderUpdatePayload = { orderId };
    this.server.emit('order.updated', payload);
  }

  @SubscribeMessage('ping')
  handlePing(): string {
    return 'pong';
  }
}
