import { apiClient } from "@/lib/api-client";

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "essay"
  | "fill_in_blank";

export type QuizQuestion = {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
  order: number;
};

export type QuizDto = {
  _id: string;
  title: string;
  description?: string;
  course: string | { _id: string; title?: string };
  instructor: string | { _id: string; firstName?: string; lastName?: string };
  lesson?: string | { _id: string; title?: string };
  questions: QuizQuestion[];
  totalPoints: number;
  passingScore: number;
  duration: number;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  allowReview: boolean;
  availableFrom?: string;
  availableUntil?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateQuizPayload = {
  title: string;
  description?: string;
  courseId: string;
  lessonId?: string;
  moduleId?: string;
  questions: Omit<QuizQuestion, "id">[];
  passingScore: number;
  duration: number;
  attemptsAllowed?: number;
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
  allowReview?: boolean;
};

export type UpdateQuizPayload = Partial<CreateQuizPayload> & {
  questions?: QuizQuestion[];
};

class QuizzesService {
  async getAllQuizzes(params: {
    courseId?: string;
    lessonId?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { data } = await apiClient.get<{ 
      success: boolean;
      quizzes: QuizDto[]; 
      total: number;
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(
      "/quizzes",
      { params }
    );
    return {
      quizzes: data.quizzes,
      total: data.total,
      pagination: data.pagination
    };
  }

  async getQuiz(id: string) {
    const { data } = await apiClient.get<{ success: boolean; data: QuizDto }>(`/quizzes/${id}`);
    return data.data || data;
  }

  async createQuiz(payload: CreateQuizPayload) {
    const { data } = await apiClient.post<{ success: boolean; message: string; data: QuizDto }>("/quizzes", payload);
    return data.data || data;
  }

  async updateQuiz(id: string, payload: UpdateQuizPayload) {
    const { data } = await apiClient.patch<{ success: boolean; message: string; data: QuizDto }>(`/quizzes/${id}`, payload);
    return data.data || data;
  }

  async deleteQuiz(id: string) {
    const { data } = await apiClient.delete<{ success: boolean; message: string }>(`/quizzes/${id}`);
    return data;
  }

  async startQuiz(id: string) {
    const { data } = await apiClient.post<{ submissionId: string }>(
      `/quizzes/${id}/start`
    );
    return data;
  }

  async submitQuiz(
    id: string,
    submissionId: string,
    payload: { answers: { questionId: string; answer: string | string[] }[]; timeSpent?: number }
  ) {
    const { data } = await apiClient.post(`/quizzes/${id}/submit/${submissionId}`, payload);
    return data;
  }

  async getMySubmissions(params: { quizId?: string; page?: number; limit?: number } = {}) {
    const { data } = await apiClient.get<{ submissions: any[]; total: number }>(
      "/quizzes/my-submissions",
      { params }
    );
    return data;
  }

  async getQuizSubmissions(id: string, params: { page?: number; limit?: number } = {}) {
    const { data } = await apiClient.get<{ submissions: any[]; total: number; stats: any }>(
      `/quizzes/${id}/submissions`,
      { params }
    );
    return data;
  }

  async getQuizStats(id: string) {
    const { data } = await apiClient.get(`/quizzes/${id}/stats`);
    return data;
  }

  async getSubmission(submissionId: string) {
    const { data } = await apiClient.get(`/quizzes/submissions/${submissionId}`);
    return data;
  }

  async toggleQuizStatus(id: string) {
    const { data } = await apiClient.patch<QuizDto>(`/quizzes/${id}/toggle-status`);
    return data;
  }

  async duplicateQuiz(id: string) {
    const { data } = await apiClient.post<QuizDto>(`/quizzes/${id}/duplicate`);
    return data;
  }

  async bulkDeleteQuizzes(ids: string[]) {
    const { data } = await apiClient.post<{ message: string }>("/quizzes/bulk-delete", { ids });
    return data;
  }

  async bulkToggleStatus(ids: string[]) {
    const { data } = await apiClient.post<{ message: string }>("/quizzes/bulk-toggle-status", { ids });
    return data;
  }

  async exportQuizzes(format: "csv" | "xlsx" | "pdf", params?: { courseId?: string }): Promise<Blob> {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const { getAccessToken } = await import('@/lib/cookies');
    const token = getAccessToken();

    const queryParams = new URLSearchParams();
    if (params?.courseId) {
      queryParams.append('courseId', params.courseId);
    }
    const queryString = queryParams.toString();
    const url = `${BASE_URL}/quizzes/export/${format}${queryString ? `?${queryString}` : ''}`;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to export quizzes: ${response.statusText}`);
    }

    return await response.blob();
  }
}

export const quizzesService = new QuizzesService();
export default quizzesService;

