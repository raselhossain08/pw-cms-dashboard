import { apiClient } from "@/lib/api-client";

export type TicketStatus = "open" | "in-progress" | "pending" | "closed" | "escalated" | "resolved" | "waiting_for_customer";
export type TicketPriority = "high" | "medium" | "low" | "urgent";
export type TicketCategory = "technical" | "billing" | "course_content" | "account" | "refund" | "feature_request" | "bug_report" | "other";

export interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  userId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    name?: string;
  } | string;
  assignedTo?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    name?: string;
  } | string;
  attachments?: string[];
  tags?: string[];
  relatedCourse?: string;
  relatedOrder?: string;
  rating?: number;
  feedback?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  replies?: TicketReply[];
  metadata?: Record<string, any>;
}

export interface TicketReply {
  _id: string;
  ticketId: string;
  userId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    name?: string;
  } | string;
  message: string;
  attachments?: string[];
  isStaffReply?: boolean;
  isInternal?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTicketDto {
  subject: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
  attachments?: string[];
  tags?: string[];
  relatedCourse?: string;
  relatedOrder?: string;
}

export interface UpdateTicketDto {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
  subject?: string;
  description?: string;
  category?: TicketCategory;
}

export interface CreateReplyDto {
  message: string;
  attachments?: string[];
  isInternal?: boolean;
}

export interface RateTicketDto {
  rating: number;
  feedback?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  pending?: number;
  resolved: number;
  closed: number;
  escalated?: number;
  avgResponseTime?: string;
  satisfactionRate?: number;
  averageResolutionTime?: number;
  satisfaction?: {
    averageRating: number;
    totalRatings: number;
  };
}

export interface TicketsResponse {
  tickets: Ticket[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class SupportService {
  async getTickets(params: {
    page?: number;
    limit?: number;
    status?: TicketStatus;
    category?: TicketCategory;
    priority?: TicketPriority;
    assignedTo?: string;
    userId?: string;
  } = {}) {
    try {
      const { data } = await apiClient.get<TicketsResponse>("/tickets", { params });
      return data;
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      throw error;
    }
  }

  async getMyTickets(params: {
    page?: number;
    limit?: number;
  } = {}) {
    try {
      const { data } = await apiClient.get<TicketsResponse>("/tickets/my-tickets", { params });
      return data;
    } catch (error) {
      console.error("Failed to fetch my tickets:", error);
      throw error;
    }
  }

  async getTicketById(id: string) {
    try {
      const { data } = await apiClient.get<{ ticket: Ticket; replies: TicketReply[] }>(`/tickets/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch ticket ${id}:`, error);
      throw error;
    }
  }

  async createTicket(ticketData: CreateTicketDto) {
    try {
      const { data } = await apiClient.post<Ticket>("/tickets", ticketData);
      return data;
    } catch (error) {
      console.error("Failed to create ticket:", error);
      throw error;
    }
  }

  async updateTicket(id: string, ticketData: UpdateTicketDto) {
    try {
      const { data } = await apiClient.patch<Ticket>(`/tickets/${id}`, ticketData);
      return data;
    } catch (error) {
      console.error(`Failed to update ticket ${id}:`, error);
      throw error;
    }
  }

  async deleteTicket(id: string) {
    try {
      await apiClient.delete(`/tickets/${id}`);
    } catch (error) {
      console.error(`Failed to delete ticket ${id}:`, error);
      throw error;
    }
  }

  async addReply(ticketId: string, replyData: CreateReplyDto) {
    try {
      const { data } = await apiClient.post<TicketReply>(`/tickets/${ticketId}/reply`, replyData);
      return data;
    } catch (error) {
      console.error(`Failed to add reply to ticket ${ticketId}:`, error);
      throw error;
    }
  }

  async rateTicket(id: string, ratingData: RateTicketDto) {
    try {
      const { data } = await apiClient.post<Ticket>(`/tickets/${id}/rate`, ratingData);
      return data;
    } catch (error) {
      console.error(`Failed to rate ticket ${id}:`, error);
      throw error;
    }
  }

  async getStats() {
    try {
      const { data } = await apiClient.get<TicketStats>("/tickets/stats");
      return data;
    } catch (error) {
      console.error("Failed to fetch ticket stats:", error);
      throw error;
    }
  }

  async assignTicket(ticketId: string, userId: string) {
    try {
      const { data } = await apiClient.patch<Ticket>(`/tickets/${ticketId}`, { assignedTo: userId });
      return data;
    } catch (error) {
      console.error(`Failed to assign ticket ${ticketId}:`, error);
      throw error;
    }
  }

  async closeTicket(id: string) {
    try {
      const { data } = await apiClient.delete<Ticket>(`/tickets/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to close ticket ${id}:`, error);
      throw error;
    }
  }
}

export const supportService = new SupportService();
export default supportService;
