import { Injectable, NotFoundException } from "@nestjs/common";
import { MessagePriority, MessageStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

interface SendMessageDto {
  senderId: string;
  senderType: string;
  recipientIds: string[];
  recipientType: string;
  subject: string;
  body: string;
  priority?: MessagePriority;
  threadId?: string;
}

interface ReplyToMessageDto {
  body: string;
  senderId: string;
  senderType: string;
}

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Send a new message (Feature #11)
   */
  async sendMessage(dto: SendMessageDto, userId: string) {
    const message = await this.prisma.message.create({
      data: {
        senderId: dto.senderId,
        senderType: dto.senderType,
        subject: dto.subject,
        body: dto.body,
        priority: dto.priority || MessagePriority.NORMAL,
        status: MessageStatus.SENT,
        threadId: dto.threadId,
        sentAt: new Date(),
        recipients: {
          create: dto.recipientIds.map((id) => ({
            recipientId: id,
            recipientType: dto.recipientType,
          })),
        },
      },
      include: {
        recipients: true,
      },
    });

    // Audit
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: "SEND_MESSAGE",
        resourceType: "Message",
        resourceId: message.id,
        success: true,
      },
    });

    return message;
  }

  /**
   * Get inbox for a user
   */
  async getInbox(userId: string, userType: string) {
    return this.prisma.message.findMany({
      where: {
        recipients: {
          some: {
            recipientId: userId,
            recipientType: userType,
          },
        },
        isDeleted: false,
      },
      include: {
        recipients: true,
        attachments: true,
      },
      orderBy: {
        sentAt: "desc",
      },
    });
  }

  /**
   * Get sent messages
   */
  async getSentMessages(userId: string) {
    return this.prisma.message.findMany({
      where: {
        senderId: userId,
        isDeleted: false,
      },
      include: {
        recipients: true,
      },
      orderBy: {
        sentAt: "desc",
      },
    });
  }

  /**
   * Get a single message
   */
  async getMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        recipients: true,
        attachments: true,
        replies: {
          include: {
            recipients: true,
          },
        },
      },
    });

    if (!message || message.isDeleted) {
      throw new NotFoundException("Message not found");
    }

    return message;
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string, userId: string) {
    await this.prisma.messageRecipient.updateMany({
      where: {
        messageId,
        recipientId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Update parent message
    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        readAt: new Date(),
        status: MessageStatus.READ,
      },
    });

    // Audit
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: "READ_MESSAGE",
        resourceType: "Message",
        resourceId: messageId,
        success: true,
      },
    });
  }

  /**
   * Reply to a message
   */
  async replyToMessage(
    messageId: string,
    dto: ReplyToMessageDto,
    userId: string
  ) {
    const originalMessage = await this.getMessage(messageId, userId);

    // Create reply in same thread
    const reply = await this.prisma.message.create({
      data: {
        senderId: dto.senderId,
        senderType: dto.senderType,
        subject: `Re: ${originalMessage.subject}`,
        body: dto.body,
        threadId: originalMessage.threadId || originalMessage.id,
        status: MessageStatus.SENT,
        recipients: {
          create: {
            recipientId: originalMessage.senderId,
            recipientType: originalMessage.senderType,
          },
        },
      },
    });

    return reply;
  }

  /**
   * Archive a message
   */
  async archiveMessage(messageId: string, userId: string) {
    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        status: MessageStatus.ARCHIVED,
      },
    });
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: string, userId: string) {
    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    // Audit
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: "DELETE_MESSAGE",
        resourceType: "Message",
        resourceId: messageId,
        success: true,
      },
    });
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string, userType: string) {
    return this.prisma.messageRecipient.count({
      where: {
        recipientId: userId,
        recipientType: userType,
        isRead: false,
        message: {
          isDeleted: false,
        },
      },
    });
  }
}
