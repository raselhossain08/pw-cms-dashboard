"use client";

import { apiClient } from "@/lib/api-client";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/cookies";

function getSocketBase() {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return API.replace(/\/api$/, "");
}

export type ChatMessage = {
  _id: string;
  conversation: string;
  sender: { _id: string; firstName?: string; lastName?: string; avatar?: string } | string;
  content: string;
  type?: string;
  createdAt?: string;
};

export type ChatConversation = {
  _id: string;
  title?: string;
  participants: Array<{ _id: string; firstName?: string; lastName?: string; avatar?: string }> | string[];
  lastMessage?: ChatMessage | string;
  unreadCount?: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

export const chatService = {
  connect(): Socket {
    const token = getAccessToken();
    const socket = io(`${getSocketBase()}/chat`, {
      auth: { token: token ? `Bearer ${token}` : undefined },
      transports: ["websocket"],
    });
    return socket;
  },

  joinConversation(socket: Socket, conversationId: string) {
    return new Promise<{ success: boolean; messages?: ChatMessage[]; error?: string }>((resolve) => {
      socket.emit(
        "join_conversation",
        { conversationId },
        (resp: { success: boolean; messages?: ChatMessage[]; error?: string }) => resolve(resp)
      );
    });
  },

  sendMessageSocket(socket: Socket, conversationId: string, content: string, type?: string) {
    return new Promise<{ success: boolean; message?: ChatMessage; error?: string }>((resolve) => {
      socket.emit(
        "send_message",
        { conversationId, content, type },
        (resp: { success: boolean; message?: ChatMessage; error?: string }) => resolve(resp)
      );
    });
  },

  typingStart(socket: Socket, conversationId: string) {
    socket.emit("typing_start", { conversationId });
  },

  typingStop(socket: Socket, conversationId: string) {
    socket.emit("typing_stop", { conversationId });
  },

  startConversationSocket(socket: Socket, participantIds: string[], title?: string) {
    return new Promise<{ success: boolean; conversation?: ChatConversation; error?: string }>((resolve) => {
      socket.emit(
        "start_conversation",
        { participantIds, title },
        (resp: { success: boolean; conversation?: ChatConversation; error?: string }) => resolve(resp)
      );
    });
  },

  createConversationSocket(socket: Socket, payload: { title: string; participants: string[]; type: string }) {
    return new Promise<{ success: boolean; conversation?: ChatConversation; error?: string }>((resolve) => {
      socket.emit(
        "create_conversation",
        payload,
        (resp: { success: boolean; conversation?: ChatConversation; error?: string }) => resolve(resp)
      );
    });
  },

  getConversations() {
    return apiClient.get<{ conversations: ChatConversation[]; total: number }>("/chat/conversations");
  },

  getMessages(conversationId: string, params?: { page?: number; limit?: number }) {
    return apiClient.get<{ messages: ChatMessage[]; total: number }>(`/chat/conversations/${conversationId}/messages`, { params });
  },

  sendMessageRest(conversationId: string, payload: { content: string; type?: string }) {
    return apiClient.post<ChatMessage>(`/chat/conversations/${conversationId}/messages`, payload);
  },

  deleteConversation(conversationId: string) {
    return apiClient.delete(`/chat/conversations/${conversationId}`);
  },

  deleteMessage(messageId: string) {
    return apiClient.delete(`/chat/messages/${messageId}`);
  },

  markAsRead(messageId: string) {
    return apiClient.patch(`/chat/messages/${messageId}/read`, {});
  },
};
