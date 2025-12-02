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

export interface TermsConditions {
  _id: string;
  headerSection: HeaderSection;
  lastUpdated: string;
  sections: TermsSection[];
  contactInfo: ContactInfo;
  seoMeta: SeoMeta;
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
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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
      return await response.json();
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
      return await response.json();
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
      return await response.json();
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
      return await response.json();
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
      return await response.json();
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
      return await response.json();
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
      return await response.json();
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
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to delete terms & conditions",
        data: null,
      };
    }
  }
}
