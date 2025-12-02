import { apiClient } from "@/lib/api-client";

export type SessionStatus = "scheduled" | "live" | "ended" | "cancelled";

export interface LiveSession {
  id?: string;
  _id: string;
  title: string;
  description?: string;
  course: { _id: string; title?: string; thumbnail?: string } | string;
  instructor: { _id: string; firstName?: string; lastName?: string; avatar?: string } | string;
  status: SessionStatus;
  scheduledAt: string;
  duration: number;
  attendees?: Array<{ _id: string }> | string[];
}

class LiveSessionsService {
  async getAll(params: {
    courseId?: string;
    status?: SessionStatus;
    upcoming?: boolean;
    page?: number;
    limit?: number;
  } = {}) {
    const { data } = await apiClient.get("/live-sessions", { params });
    return data as { sessions: LiveSession[]; total: number };
  }
}

export const liveSessionsService = new LiveSessionsService();
export default liveSessionsService;
