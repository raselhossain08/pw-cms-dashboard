import { cookieService } from "../cookie.service";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
  private static async getAuthHeader() {
    const token = cookieService.get("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private static async request<T>(
    method: string,
    url: string,
    body?: unknown
  ): Promise<T> {
    const authHeader = await this.getAuthHeader();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...authHeader,
    };

    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    if (isFormData) {
      delete headers["Content-Type"];
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers,
      credentials: "include",
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}`);
    }

    // Handle nested response structure: { success, data: { success, data: {...} } }
    if (data && data.success && data.data && data.data.success) {
      return {
        success: true,
        message: data.data.message || data.message || "Success",
        data: data.data.data,
      } as T;
    }

    return data as T;
  }

  static async getActiveRefundPolicy(): Promise<RefundPolicyResponse> {
    try {
      return await this.request<RefundPolicyResponse>("GET", "/cms/refund-policy/active");
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch active refund policy",
      };
    }
  }

  static async getAllRefundPolicies(): Promise<RefundPolicyResponse> {
    try {
      return await this.request<RefundPolicyResponse>("GET", "/cms/refund-policy");
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch refund policies",
      };
    }
  }

  static async getDefaultRefundPolicy(): Promise<RefundPolicyResponse> {
    try {
      return await this.request<RefundPolicyResponse>("GET", "/cms/refund-policy/default");
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch default refund policy",
      };
    }
  }

  static async getRefundPolicyById(id: string): Promise<RefundPolicyResponse> {
    try {
      return await this.request<RefundPolicyResponse>("GET", `/cms/refund-policy/${id}`);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch refund policy",
      };
    }
  }

  static async createRefundPolicy(data: Partial<RefundPolicy>): Promise<RefundPolicyResponse> {
    try {
      return await this.request<RefundPolicyResponse>("POST", "/cms/refund-policy", data);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to create refund policy",
      };
    }
  }

  static async updateRefundPolicy(id: string, data: Partial<RefundPolicy>): Promise<RefundPolicyResponse> {
    try {
      return await this.request<RefundPolicyResponse>("PUT", `/cms/refund-policy/${id}`, data);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update refund policy",
      };
    }
  }

  static async updateRefundPolicyWithUpload(
    id: string,
    formData: FormData
  ): Promise<RefundPolicyResponse> {
    try {
      return await this.request<RefundPolicyResponse>("PUT", `/cms/refund-policy/${id}/upload`, formData);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update refund policy with upload",
      };
    }
  }

  static async deleteRefundPolicy(id: string): Promise<RefundPolicyResponse> {
    try {
      return await this.request<RefundPolicyResponse>("DELETE", `/cms/refund-policy/${id}`);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to delete refund policy",
      };
    }
  }

  static async toggleActiveStatus(id: string): Promise<RefundPolicyResponse> {
    try {
      return await this.request<RefundPolicyResponse>("POST", `/cms/refund-policy/${id}/toggle-active`, {});
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to toggle refund policy status",
      };
    }
  }

  static async duplicateRefundPolicy(id: string): Promise<RefundPolicyResponse> {
    try {
      return await this.request<RefundPolicyResponse>("POST", `/cms/refund-policy/${id}/duplicate`, {});
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to duplicate refund policy",
      };
    }
  }

  static async exportRefundPolicy(format: "json" | "pdf", id?: string): Promise<void> {
    try {
      const url = id
        ? `${API_BASE_URL}/cms/refund-policy/${id}/export?format=${format}`
        : `${API_BASE_URL}/cms/refund-policy/export?format=${format}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookieService.get("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export refund policy");
      }

      const blob = await response.blob();
      const url_blob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url_blob;
      link.download = `refund-policy-export_${new Date().toISOString().split("T")[0]}.${format === "pdf" ? "pdf" : "json"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url_blob);
    } catch (error: any) {
      throw new Error(error.message || "Failed to export refund policy");
    }
  }
}
