"use client";

import { apiClient } from "@/lib/api-client";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/cookies";

export type BotMessageResponse = {
  sessionId?: string;
  message: string;
  quickReplies?: string[];
};

export type BotMessage = {
  role: "user" | "bot" | "system";
  content: string;
  timestamp?: string | Date;
};

export type BotConversationDoc = {
  sessionId: string;
  messages: BotMessage[];
  lastActiveAt?: string | Date;
};

function getSocketBase() {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return API.replace(/\/api$/, "");
}

export const aiBotService = {
  connect(userId: string, sessionId: string): Socket {
    const token = getAccessToken();
    const socket = io(`${getSocketBase()}/ai-bot`, {
      auth: { token: token ? `Bearer ${token}` : undefined },
      transports: ["websocket"],
    });
    socket.on("connect", () => {
      socket.emit("join", { userId, sessionId });
    });
    return socket;
  },

  sendMessageRest(message: string, sessionId: string, context?: Record<string, unknown>) {
    return apiClient.post<BotMessageResponse>("/ai-bot/chat", {
      message,
      sessionId,
      context,
    });
  },

  getHistory(sessionId?: string) {
    return apiClient.get<BotConversationDoc[]>("/ai-bot/history", {
      params: sessionId ? { sessionId } : undefined,
    });
  },

  rateConversation(sessionId: string, rating: number, feedback?: string) {
    return apiClient.post("/ai-bot/rate", {
      sessionId,
      rating: rating.toString(),
      feedback,
    });
  },

  escalateToHuman(sessionId: string, reason?: string) {
    return apiClient.post("/ai-bot/escalate", {
      sessionId,
      reason: reason || "user_request",
    });
  },

  deleteConversation(sessionId: string) {
    return apiClient.delete(`/ai-bot/conversations/${sessionId}`);
  },

  getStatus() {
    return apiClient.get<{
      status: string;
      aiEnabled: boolean;
      openAIEnabled: boolean;
      geminiEnabled: boolean;
      timestamp: string;
    }>("/ai-bot/status");
  },

  // Knowledge Base Management
  getKnowledge(filters?: Record<string, string | number | boolean | undefined>) {
    return apiClient.get("/ai-bot/knowledge", { params: filters });
  },

  addKnowledge(data: {
    category: string;
    question: string;
    answer: string;
    keywords?: string[];
    relatedIntents?: string[];
  }) {
    return apiClient.post("/ai-bot/knowledge", data);
  },

  updateKnowledge(id: string, updates: Partial<{
    category: string;
    question: string;
    answer: string;
    keywords?: string[];
    relatedIntents?: string[];
  }>) {
    return apiClient.patch(`/ai-bot/knowledge/${id}`, updates);
  },

  deleteKnowledge(id: string) {
    return apiClient.delete(`/ai-bot/knowledge/${id}`);
  },

  // Task Management
  getTasks(filters?: Record<string, string | number | boolean | undefined>) {
    return apiClient.get("/ai-bot/tasks", { params: filters });
  },

  createTask(data: {
    title: string;
    description: string;
    priority: string;
    dueDate?: string;
    assignedTo?: string;
  }) {
    return apiClient.post("/ai-bot/tasks", data);
  },

  updateTask(id: string, updates: Partial<{
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate?: string;
    assignedTo?: string;
  }>) {
    return apiClient.put(`/ai-bot/tasks/${id}`, updates);
  },

  deleteTask(id: string) {
    return apiClient.delete(`/ai-bot/tasks/${id}`);
  },

  assignTask(id: string, assignedTo: string) {
    return apiClient.post(`/ai-bot/tasks/${id}/assign`, { assignedTo });
  },

  getTaskStats() {
    return apiClient.get("/ai-bot/tasks/stats");
  },

  // Analytics
  getAnalytics(startDate?: string, endDate?: string) {
    return apiClient.get("/ai-bot/analytics", {
      params: { startDate, endDate },
    });
  },
};
