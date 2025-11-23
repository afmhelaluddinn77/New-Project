import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export interface Message {
  id: string;
  threadId?: string;
  senderId: string;
  senderType: string;
  subject: string;
  body: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status: "DRAFT" | "SENT" | "DELIVERED" | "READ" | "ARCHIVED" | "DELETED";
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  recipients: MessageRecipient[];
  attachments?: MessageAttachment[];
  replies?: Message[];
}

export interface MessageRecipient {
  id: string;
  recipientId: string;
  recipientType: string;
  role: "SENDER" | "RECIPIENT" | "CC";
  isRead: boolean;
  readAt?: string;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageUrl: string;
}

export interface SendMessageRequest {
  senderId: string;
  senderType: string;
  recipientIds: string[];
  recipientType: string;
  subject: string;
  body: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  threadId?: string;
}

export interface ReplyToMessageRequest {
  body: string;
  senderId: string;
  senderType: string;
}

export const messagingService = {
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    const response = await apiClient.post<Message>("/messages", data);
    return response.data;
  },

  async getInbox(): Promise<Message[]> {
    const response = await apiClient.get<Message[]>("/messages/inbox");
    return response.data;
  },

  async getSentMessages(): Promise<Message[]> {
    const response = await apiClient.get<Message[]>("/messages/sent");
    return response.data;
  },

  async getMessage(messageId: string): Promise<Message> {
    const response = await apiClient.get<Message>(`/messages/${messageId}`);
    return response.data;
  },

  async markAsRead(messageId: string): Promise<void> {
    await apiClient.patch(`/messages/${messageId}/read`);
  },

  async replyToMessage(
    messageId: string,
    data: ReplyToMessageRequest
  ): Promise<Message> {
    const response = await apiClient.post<Message>(
      `/messages/${messageId}/reply`,
      data
    );
    return response.data;
  },

  async archiveMessage(messageId: string): Promise<void> {
    await apiClient.patch(`/messages/${messageId}/archive`);
  },

  async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete(`/messages/${messageId}`);
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<number>("/messages/unread-count");
    return response.data;
  },
};
