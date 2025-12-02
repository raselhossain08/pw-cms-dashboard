import axios from "axios";
import { getCookie } from "../cookie.service";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333";

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
  privacyTeam: string;
  generalSupport: string;
  phone: string;
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

export interface PrivacyPolicy {
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

export interface PrivacyPolicyResponse {
  success: boolean;
  message: string;
  data?: PrivacyPolicy | PrivacyPolicy[];
}

export class PrivacyPolicyService {
  private static getAuthHeader() {
    const token = getCookie("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  static async getActivePrivacyPolicy(): Promise<PrivacyPolicyResponse> {
    try {
      const response = await axios.get<PrivacyPolicyResponse>(
        `${API_BASE_URL}/cms/privacy-policy/active`,
        {
          headers: this.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch active privacy policy",
      };
    }
  }

  static async getAllPrivacyPolicies(): Promise<PrivacyPolicyResponse> {
    try {
      const response = await axios.get<PrivacyPolicyResponse>(
        `${API_BASE_URL}/cms/privacy-policy`,
        {
          headers: this.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch privacy policies",
      };
    }
  }

  static async getDefaultPrivacyPolicy(): Promise<PrivacyPolicyResponse> {
    try {
      const response = await axios.get<PrivacyPolicyResponse>(
        `${API_BASE_URL}/cms/privacy-policy/default`,
        {
          headers: this.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch default privacy policy",
      };
    }
  }

  static async getPrivacyPolicyById(
    id: string
  ): Promise<PrivacyPolicyResponse> {
    try {
      const response = await axios.get<PrivacyPolicyResponse>(
        `${API_BASE_URL}/cms/privacy-policy/${id}`,
        {
          headers: this.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch privacy policy",
      };
    }
  }

  static async createPrivacyPolicy(
    data: Partial<PrivacyPolicy>
  ): Promise<PrivacyPolicyResponse> {
    try {
      const response = await axios.post<PrivacyPolicyResponse>(
        `${API_BASE_URL}/cms/privacy-policy`,
        data,
        {
          headers: this.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create privacy policy",
      };
    }
  }

  static async updatePrivacyPolicy(
    id: string,
    data: Partial<PrivacyPolicy>
  ): Promise<PrivacyPolicyResponse> {
    try {
      const response = await axios.put<PrivacyPolicyResponse>(
        `${API_BASE_URL}/cms/privacy-policy/${id}`,
        data,
        {
          headers: this.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update privacy policy",
      };
    }
  }

  static async updatePrivacyPolicyWithUpload(
    id: string,
    formData: FormData
  ): Promise<PrivacyPolicyResponse> {
    try {
      const token = getCookie("token");
      const response = await axios.put<PrivacyPolicyResponse>(
        `${API_BASE_URL}/cms/privacy-policy/${id}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update privacy policy with upload",
      };
    }
  }

  static async deletePrivacyPolicy(id: string): Promise<PrivacyPolicyResponse> {
    try {
      const response = await axios.delete<PrivacyPolicyResponse>(
        `${API_BASE_URL}/cms/privacy-policy/${id}`,
        {
          headers: this.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete privacy policy",
      };
    }
  }
}
