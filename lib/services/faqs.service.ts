import axios from "axios";
import { cookieService } from "../cookie.service";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333";

export interface HeaderSection {
  badge: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
}

export interface Category {
  name: string;
  icon: string;
  count: number;
  color: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isActive?: boolean;
  order?: number;
}

export interface SeoMeta {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export interface Faqs {
  _id?: string;
  headerSection: HeaderSection;
  categories: Category[];
  faqs: FaqItem[];
  seoMeta: SeoMeta;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FaqsResponse {
  success: boolean;
  message: string;
  data?: Faqs;
}

export class FaqsService {
  private static getAuthHeader() {
    const token = cookieService.get("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static async getActiveFaqs(): Promise<FaqsResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/cms/faqs/active`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch active FAQs",
      };
    }
  }

  static async getAllFaqs(): Promise<FaqsResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/cms/faqs`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch FAQs",
      };
    }
  }

  static async getDefaultFaqs(): Promise<FaqsResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/cms/faqs/default`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch default FAQs",
      };
    }
  }

  static async getFaqsById(id: string): Promise<FaqsResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/cms/faqs/${id}`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch FAQs",
      };
    }
  }

  static async createFaqs(data: Partial<Faqs>): Promise<FaqsResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/cms/faqs`, data, {
        headers: {
          ...this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create FAQs",
      };
    }
  }

  static async updateFaqs(id: string, data: Partial<Faqs>): Promise<FaqsResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/cms/faqs/${id}`, data, {
        headers: {
          ...this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update FAQs",
      };
    }
  }

  static async updateFaqsWithUpload(
    id: string,
    formData: FormData
  ): Promise<FaqsResponse> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/cms/faqs/${id}/upload`,
        formData,
        {
          headers: {
            ...this.getAuthHeader(),
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update FAQs with upload",
      };
    }
  }

  static async deleteFaqs(id: string): Promise<FaqsResponse> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cms/faqs/${id}`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete FAQs",
      };
    }
  }
}
