import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

/**
 * Notification WebSocket Gateway
 *
 * Development Law: JWT authentication for socket connections
 * Sends real-time notifications to connected clients
 */
@Injectable()
@WebSocketGateway({
  cors: {
    origin: [
      "http://localhost:5174", // Provider Portal
      "http://localhost:5175", // Patient Portal
      "http://localhost:5176", // Admin Portal
    ],
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Map userId → socketId[] (user can have multiple tabs/devices connected)
  private userSockets = new Map<string, string[]>();

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Handle client connection
   * Authenticate via JWT token
   */
  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        console.log(`❌ WebSocket connection rejected: No token provided`);
        client.disconnect();
        return;
      }

      // Verify JWT
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub || payload.userId;

      if (!userId) {
        console.log(`❌ WebSocket connection rejected: Invalid token payload`);
        client.disconnect();
        return;
      }

      // Store user → socket mapping
      const userSocketIds = this.userSockets.get(userId) || [];
      userSocketIds.push(client.id);
      this.userSockets.set(userId, userSocketIds);

      // Attach userId to socket for easy access
      (client as any).userId = userId;

      // Join user-specific room
      client.join(`user:${userId}`);

      console.log(
        `✅ User ${userId} connected via WebSocket (socket: ${client.id})`
      );
      console.log(`   Total sockets for user: ${userSocketIds.length}`);

      // Send welcome message
      client.emit("connected", {
        message: "Connected to notification service",
        userId,
      });
    } catch (error) {
      console.error(`❌ WebSocket authentication error:`, error.message);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;

    if (userId) {
      // Remove socket from user mapping
      const userSocketIds = this.userSockets.get(userId) || [];
      const updatedSocketIds = userSocketIds.filter((id) => id !== client.id);

      if (updatedSocketIds.length > 0) {
        this.userSockets.set(userId, updatedSocketIds);
      } else {
        this.userSockets.delete(userId);
      }

      console.log(`👋 User ${userId} disconnected (socket: ${client.id})`);
      console.log(`   Remaining sockets for user: ${updatedSocketIds.length}`);
    }
  }

  /**
   * Send notification to specific user
   * All connected sockets for that user will receive the notification
   */
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
    console.log(`📤 Sent ${event} to user ${userId}`);
  }

  /**
   * Send notification to multiple users
   */
  sendToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((userId) => {
      this.sendToUser(userId, event, data);
    });
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
    console.log(`📢 Broadcast ${event} to all users`);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}
