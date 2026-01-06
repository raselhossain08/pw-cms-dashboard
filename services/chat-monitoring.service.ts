"use client";

import { apiClient } from "@/lib/api-client";

export interface ChatMonitoringStats {
  activeConversations: number;
  waitingUsers: number;
  onlineAgents: number;
  queueLength: number;
  averageWaitTime: number;
  responseTimes: {
    immediate: number;
    within1Min: number;
    within5Min: number;
    within30Min: number;
    over30Min: number;
  };
  performanceMetrics: {
    firstResponseTime: number;
    resolutionTime: number;
    agentPerformance: Array<{
      agentId: string;
      resolved: number;
      avgTime: number;
    }>;
  };
}

export interface ActiveChatSession {
  id: string;
  userName: string;
  userEmail: string;
  startedAt: string;
  lastMessage: string;
  waitTime: number;
  status: "active" | "waiting" | "resolved";
  agentId?: string;
}

export const chatMonitoringService = {
  /**
   * Get real-time monitoring statistics
   */
  async getStats(): Promise<ChatMonitoringStats> {
    const response = await apiClient.get<ChatMonitoringStats>("/chat/monitoring/stats");
    return response.data;
  },

  /**
   * Get active chat sessions
   */
  async getActiveSessions(): Promise<ActiveChatSession[]> {
    const response = await apiClient.get<ActiveChatSession[]>("/chat/monitoring/sessions");
    return response.data;
  },

  /**
   * Assign an agent to a conversation
   */
  async assignAgent(conversationId: string, agentId: string): Promise<void> {
    await apiClient.post(`/chat/conversations/${conversationId}/assign`, { agentId });
  },

  /**
   * Mark a conversation as resolved
   */
  async markResolved(conversationId: string): Promise<void> {
    await apiClient.post(`/chat/conversations/${conversationId}/resolve`);
  },
};

