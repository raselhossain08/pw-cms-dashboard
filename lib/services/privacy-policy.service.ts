import { cookieService } from "@/lib/cookie.service";

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
  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  private static getAuthHeader() {
    const token = cookieService.get("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  static async getActivePrivacyPolicy(): Promise<PrivacyPolicyResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/privacy-policy/active`,
        {
          headers: this.getAuthHeader(),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to fetch: ${response.status} ${response.statusText}`,
        };
      }

      const result = await response.json();

      // Handle nested response structure
      if (result && result.success && result.data && result.data.success && result.data.data) {
        return {
          success: true,
          message: result.data.message || "Success",
          data: result.data.data,
        };
      }

      return {
        success: false,
        message: result?.message || "Invalid response structure",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch active privacy policy",
      };
    }
  }

  static async getAllPrivacyPolicies(): Promise<PrivacyPolicyResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/privacy-policy`,
        {
          headers: this.getAuthHeader(),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to fetch: ${response.status} ${response.statusText}`,
        };
      }

      const result = await response.json();

      // Handle nested response structure
      if (result && result.success && result.data && result.data.success && result.data.data) {
        return {
          success: true,
          message: result.data.message || "Success",
          data: result.data.data,
        };
      }

      return {
        success: false,
        message: result?.message || "Invalid response structure",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch privacy policies",
      };
    }
  }

  static async getDefaultPrivacyPolicy(): Promise<PrivacyPolicyResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/privacy-policy/default`,
        {
          headers: this.getAuthHeader(),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to fetch: ${response.status} ${response.statusText}`,
        };
      }

      const result = await response.json();

      // Handle nested response structure
      if (result && result.success && result.data && result.data.success && result.data.data) {
        return {
          success: true,
          message: result.data.message || "Success",
          data: result.data.data,
        };
      }

      return {
        success: false,
        message: result?.message || "Invalid response structure",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch default privacy policy",
      };
    }
  }

  static async getPrivacyPolicyById(
    id: string
  ): Promise<PrivacyPolicyResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/privacy-policy/${id}`,
        {
          headers: this.getAuthHeader(),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to fetch: ${response.status} ${response.statusText}`,
        };
      }

      const result = await response.json();

      // Handle nested response structure
      if (result && result.success && result.data && result.data.success && result.data.data) {
        return {
          success: true,
          message: result.data.message || "Success",
          data: result.data.data,
        };
      }

      return {
        success: false,
        message: result?.message || "Invalid response structure",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch privacy policy",
      };
    }
  }

  static async createPrivacyPolicy(
    data: Partial<PrivacyPolicy>
  ): Promise<PrivacyPolicyResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/privacy-policy`,
        {
          method: "POST",
          headers: this.getAuthHeader(),
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to create: ${response.status} ${response.statusText}`,
        };
      }

      const result = await response.json();

      // Handle nested response structure
      if (result && result.success && result.data && result.data.success && result.data.data) {
        return {
          success: true,
          message: result.data.message || "Success",
          data: result.data.data,
        };
      }

      return {
        success: false,
        message: result?.message || "Invalid response structure",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to create privacy policy",
      };
    }
  }

  static async updatePrivacyPolicy(
    id: string,
    data: Partial<PrivacyPolicy>
  ): Promise<PrivacyPolicyResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/privacy-policy/${id}`,
        {
          method: "PUT",
          headers: this.getAuthHeader(),
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to update: ${response.status} ${response.statusText}`,
        };
      }

      const result = await response.json();

      // Handle nested response structure
      if (result && result.success && result.data && result.data.success && result.data.data) {
        return {
          success: true,
          message: result.data.message || "Success",
          data: result.data.data,
        };
      }

      return {
        success: false,
        message: result?.message || "Invalid response structure",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update privacy policy",
      };
    }
  }

  static async updatePrivacyPolicyWithUpload(
    id: string,
    formData: FormData
  ): Promise<PrivacyPolicyResponse> {
    try {
      const token = cookieService.get("token");
      const response = await fetch(
        `${this.API_BASE_URL}/cms/privacy-policy/${id}/upload`,
        {
          method: "PUT",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to upload: ${response.status} ${response.statusText}`,
        };
      }

      const result = await response.json();

      // Handle nested response structure
      if (result && result.success && result.data && result.data.success && result.data.data) {
        return {
          success: true,
          message: result.data.message || "Success",
          data: result.data.data,
        };
      }

      return {
        success: false,
        message: result?.message || "Invalid response structure",
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.message || "Failed to update privacy policy with upload",
      };
    }
  }

  static async deletePrivacyPolicy(id: string): Promise<PrivacyPolicyResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/privacy-policy/${id}`,
        {
          method: "DELETE",
          headers: this.getAuthHeader(),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to delete: ${response.status} ${response.statusText}`,
        };
      }

      const result = await response.json();

      // Handle nested response structure
      if (result && result.success && result.data && result.data.success) {
        return {
          success: true,
          message: result.data.message || "Success",
          data: result.data.data,
        };
      }

      return {
        success: false,
        message: result?.message || "Invalid response structure",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to delete privacy policy",
      };
    }
  }

  static async toggleActiveStatus(id: string): Promise<PrivacyPolicyResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/privacy-policy/${id}/toggle-active`,
        {
          method: "POST",
          headers: this.getAuthHeader(),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to toggle: ${response.status} ${response.statusText}`,
        };
      }

      const result = await response.json();

      // Handle nested response structure
      if (result && result.success && result.data && result.data.success && result.data.data) {
        return {
          success: true,
          message: result.data.message || "Success",
          data: result.data.data,
        };
      }

      return {
        success: false,
        message: result?.message || "Invalid response structure",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to toggle privacy policy status",
      };
    }
  }

  static async duplicatePrivacyPolicy(id: string): Promise<PrivacyPolicyResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/privacy-policy/${id}/duplicate`,
        {
          method: "POST",
          headers: this.getAuthHeader(),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to duplicate: ${response.status} ${response.statusText}`,
        };
      }

      const result = await response.json();

      // Handle nested response structure
      if (result && result.success && result.data && result.data.success && result.data.data) {
        return {
          success: true,
          message: result.data.message || "Success",
          data: result.data.data,
        };
      }

      return {
        success: false,
        message: result?.message || "Invalid response structure",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to duplicate privacy policy",
      };
    }
  }

  static async exportPrivacyPolicy(format: "json" | "pdf", id?: string): Promise<void> {
    try {
      const url = id
        ? `${this.API_BASE_URL}/cms/privacy-policy/${id}/export?format=${format}`
        : `${this.API_BASE_URL}/cms/privacy-policy/export?format=${format}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error("Failed to export privacy policy");
      }

      const blob = await response.blob();
      const url_blob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url_blob;
      link.download = `privacy-policy-export_${new Date().toISOString().split("T")[0]}.${format === "pdf" ? "pdf" : "json"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url_blob);
    } catch (error: any) {
      throw new Error(error.message || "Failed to export privacy policy");
    }
  }
}
