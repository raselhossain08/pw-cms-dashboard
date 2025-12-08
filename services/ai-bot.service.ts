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
};
