import axios from "axios";
import { getCookie } from "../cookie.service";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333";

export interface HeaderSection {
  title: string;
  subtitle: string;
  image?: string;
  imageAlt?: string;
}

export interface SubSection {
  title: string;
  content: string[];
}

export interface PolicySection {
  id: string;
  title: string;
  content: string[];
  subsections?: SubSection[];
  isActive: boolean;
  order: number;
}

export interface ContactInfo {
  refundDepartment: string;
  generalSupport: string;
  phone: string;
  businessHours: string;
  address: string;
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

export interface RefundPolicy {
  _id?: string;
  headerSection: HeaderSection;
  lastUpdated: string;
  sections: PolicySection[];
  contactInfo: ContactInfo;
  seoMeta: SeoMeta;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RefundPolicyResponse {
  success: boolean;
  message: string;
  data?: RefundPolicy;
}

export class RefundPolicyService {
  private static getAuthHeader() {
    const token = getCookie("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static async getActiveRefundPolicy(): Promise<RefundPolicyResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/cms/refund-policy/active`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch active refund policy",
      };
    }
  }

  static async getAllRefundPolicies(): Promise<RefundPolicyResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/cms/refund-policy`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch refund policies",
      };
    }
  }

  static async getDefaultRefundPolicy(): Promise<RefundPolicyResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/cms/refund-policy/default`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch default refund policy",
      };
    }
  }

  static async getRefundPolicyById(id: string): Promise<RefundPolicyResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/cms/refund-policy/${id}`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch refund policy",
      };
    }
  }

  static async createRefundPolicy(data: Partial<RefundPolicy>): Promise<RefundPolicyResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/cms/refund-policy`, data, {
        headers: {
          ...this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create refund policy",
      };
    }
  }

  static async updateRefundPolicy(id: string, data: Partial<RefundPolicy>): Promise<RefundPolicyResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/cms/refund-policy/${id}`, data, {
        headers: {
          ...this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update refund policy",
      };
    }
  }

  static async updateRefundPolicyWithUpload(
    id: string,
    formData: FormData
  ): Promise<RefundPolicyResponse> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/cms/refund-policy/${id}/upload`,
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
          error.response?.data?.message || "Failed to update refund policy with upload",
      };
    }
  }

  static async deleteRefundPolicy(id: string): Promise<RefundPolicyResponse> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cms/refund-policy/${id}`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete refund policy",
      };
    }
  }
}
