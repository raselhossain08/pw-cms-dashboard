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

export interface TermsSection {
  id: string;
  title: string;
  content: string[];
  subsections?: SubSection[];
  isActive: boolean;
  order: number;
}

export interface ContactInfo {
  email: string;
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

export interface AcceptanceSection {
  title: string;
  content: string;
  isActive: boolean;
}

export interface TermsConditions {
  _id: string;
  headerSection: HeaderSection;
  lastUpdated: string;
  sections: TermsSection[];
  contactInfo: ContactInfo;
  seoMeta: SeoMeta;
  acceptanceSection: AcceptanceSection;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TermsConditionsResponse {
  success: boolean;
  message: string;
  data: TermsConditions | null;
}

export class TermsConditionsService {
  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  private static getAuthHeader() {
    const token = cookieService.get("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  static async getActiveTermsConditions(): Promise<TermsConditionsResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/terms-conditions/active`,
        {
          headers: this.getAuthHeader(),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to fetch: ${response.status} ${response.statusText}`,
          data: null,
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
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch active terms & conditions",
        data: null,
      };
    }
  }

  static async getAllTermsConditions(): Promise<TermsConditionsResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/terms-conditions`,
        {
          headers: this.getAuthHeader(),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to fetch: ${response.status} ${response.statusText}`,
          data: null,
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
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch terms & conditions",
        data: null,
      };
    }
  }

  static async getDefaultTermsConditions(): Promise<TermsConditionsResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/terms-conditions/default`,
        {
          headers: this.getAuthHeader(),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to fetch: ${response.status} ${response.statusText}`,
          data: null,
        };
      }

      const result = await response.json();

      // Handle nested response structure: { success, data: { success, data: {...} } }
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
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch default terms & conditions",
        data: null,
      };
    }
  }

  static async getTermsConditionsById(
    id: string
  ): Promise<TermsConditionsResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/terms-conditions/${id}`,
        {
          headers: this.getAuthHeader(),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to fetch: ${response.status} ${response.statusText}`,
          data: null,
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
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch terms & conditions",
        data: null,
      };
    }
  }

  static async createTermsConditions(
    data: Partial<TermsConditions>
  ): Promise<TermsConditionsResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/terms-conditions`,
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
          data: null,
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
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to create terms & conditions",
        data: null,
      };
    }
  }

  static async updateTermsConditions(
    id: string,
    data: Partial<TermsConditions>
  ): Promise<TermsConditionsResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/terms-conditions/${id}`,
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
          data: null,
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
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update terms & conditions",
        data: null,
      };
    }
  }

  static async updateTermsConditionsWithUpload(
    id: string,
    formData: FormData
  ): Promise<TermsConditionsResponse> {
    try {
      const token = cookieService.get("token");
      const response = await fetch(
        `${this.API_BASE_URL}/cms/terms-conditions/${id}/upload`,
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
          data: null,
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
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.message || "Failed to update terms & conditions with upload",
        data: null,
      };
    }
  }

  static async deleteTermsConditions(
    id: string
  ): Promise<TermsConditionsResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/terms-conditions/${id}`,
        {
          method: "DELETE",
          headers: this.getAuthHeader(),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to delete: ${response.status} ${response.statusText}`,
          data: null,
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
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to delete terms & conditions",
        data: null,
      };
    }
  }

  static async toggleActiveStatus(id: string): Promise<TermsConditionsResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/terms-conditions/${id}/toggle-active`,
        {
          method: "POST",
          headers: this.getAuthHeader(),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to toggle status: ${response.status} ${response.statusText}`,
          data: null,
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
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to toggle terms & conditions status",
        data: null,
      };
    }
  }

  static async duplicateTermsConditions(id: string): Promise<TermsConditionsResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/terms-conditions/${id}/duplicate`,
        {
          method: "POST",
          headers: this.getAuthHeader(),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to duplicate: ${response.status} ${response.statusText}`,
          data: null,
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
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to duplicate terms & conditions",
        data: null,
      };
    }
  }

  static async exportTermsConditions(format: "json" | "pdf", id?: string): Promise<void> {
    try {
      const url = id
        ? `${this.API_BASE_URL}/cms/terms-conditions/${id}/export?format=${format}`
        : `${this.API_BASE_URL}/cms/terms-conditions/export?format=${format}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error("Failed to export terms & conditions");
      }

      const blob = await response.blob();
      const url_blob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url_blob;
      link.download = `terms-conditions-export_${new Date().toISOString().split("T")[0]}.${format === "pdf" ? "pdf" : "json"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url_blob);
    } catch (error: any) {
      throw new Error(error.message || "Failed to export terms & conditions");
    }
  }
}
