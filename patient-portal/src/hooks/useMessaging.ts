import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  messagingService,
  type ReplyToMessageRequest,
  type SendMessageRequest,
} from "../services/messagingService";

export const messagingKeys = {
  all: ["messages"] as const,
  inbox: () => ["messages", "inbox"] as const,
  sent: () => ["messages", "sent"] as const,
  detail: (messageId: string) => ["messages", "detail", messageId] as const,
  unreadCount: () => ["messages", "unreadCount"] as const,
};

export function useInbox() {
  return useQuery({
    queryKey: messagingKeys.inbox(),
    queryFn: () => messagingService.getInbox(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useSentMessages() {
  return useQuery({
    queryKey: messagingKeys.sent(),
    queryFn: () => messagingService.getSentMessages(),
    staleTime: 60 * 1000,
  });
}

export function useMessage(messageId: string) {
  return useQuery({
    queryKey: messagingKeys.detail(messageId),
    queryFn: () => messagingService.getMessage(messageId),
    enabled: !!messageId,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: messagingKeys.unreadCount(),
    queryFn: () => messagingService.getUnreadCount(),
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) =>
      messagingService.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.sent() });
      queryClient.invalidateQueries({ queryKey: messagingKeys.unreadCount() });
    },
  });
}

export function useReplyToMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      data,
    }: {
      messageId: string;
      data: ReplyToMessageRequest;
    }) => messagingService.replyToMessage(messageId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.detail(variables.messageId),
      });
      queryClient.invalidateQueries({ queryKey: messagingKeys.sent() });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messagingService.markAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.inbox() });
      queryClient.invalidateQueries({ queryKey: messagingKeys.unreadCount() });
    },
  });
}

export function useArchiveMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      messagingService.archiveMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.inbox() });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      messagingService.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.all });
    },
  });
}
