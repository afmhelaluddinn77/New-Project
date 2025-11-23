import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { MessageService } from "./message.service";

@ApiTags("messages")
@Controller("messages")
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: "Send a new message" })
  sendMessage(@Body() body: any, @Request() req: any) {
    return this.messageService.sendMessage(body, req.user.id);
  }

  @Get("inbox")
  @ApiOperation({ summary: "Get inbox messages" })
  getInbox(@Request() req: any) {
    return this.messageService.getInbox(req.user.id, req.user.type);
  }

  @Get("sent")
  @ApiOperation({ summary: "Get sent messages" })
  getSentMessages(@Request() req: any) {
    return this.messageService.getSentMessages(req.user.id);
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread message count" })
  getUnreadCount(@Request() req: any) {
    return this.messageService.getUnreadCount(req.user.id, req.user.type);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get message by ID" })
  getMessage(@Param("id") id: string, @Request() req: any) {
    return this.messageService.getMessage(id, req.user.id);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark message as read" })
  markAsRead(@Param("id") id: string, @Request() req: any) {
    return this.messageService.markAsRead(id, req.user.id);
  }

  @Post(":id/reply")
  @ApiOperation({ summary: "Reply to a message" })
  replyToMessage(
    @Param("id") id: string,
    @Body() body: any,
    @Request() req: any
  ) {
    return this.messageService.replyToMessage(id, body, req.user.id);
  }

  @Patch(":id/archive")
  @ApiOperation({ summary: "Archive a message" })
  archiveMessage(@Param("id") id: string, @Request() req: any) {
    return this.messageService.archiveMessage(id, req.user.id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a message" })
  deleteMessage(@Param("id") id: string, @Request() req: any) {
    return this.messageService.deleteMessage(id, req.user.id);
  }
}
