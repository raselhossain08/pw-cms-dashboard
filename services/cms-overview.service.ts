import { cookieService } from "@/lib/cookie.service";

export interface CMSOverviewStats {
  banners: {
    total: number;
    active: number;
    inactive: number;
  };
  events: {
    total: number;
    active: number;
    inactive: number;
  };
  testimonials: {
    total: number;
    active: number;
    inactive: number;
  };
  blogPosts: {
    total: number;
    published: number;
    draft: number;
  };
  aboutSection: {
    isActive: boolean;
    hasContent: boolean;
  };
  pages: {
    aboutUs: boolean;
    contact: boolean;
    faqs: boolean;
    privacyPolicy: boolean;
    refundPolicy: boolean;
    termsConditions: boolean;
  };
  header: {
    configured: boolean;
  };
  footer: {
    configured: boolean;
  };
}

export interface CMSSection {
  id: string;
  label: string;
  href: string;
  icon: string;
  status: "active" | "inactive" | "configured" | "empty" | "loading" | "manage";
  category: "home" | "pages" | "policies" | "navigation";
  lastUpdated?: string;
  hasContent: boolean;
}

class CMSOverviewService {
  private readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  private getAuthHeader() {
    const token = cookieService.get("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getOverviewStats(): Promise<CMSOverviewStats> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/overview/stats`,
        {
          headers: this.getAuthHeader(),
          cache: "no-store",
        }
      );
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Failed to fetch CMS overview stats:", error);
      throw error;
    }
  }

  async getSections(): Promise<CMSSection[]> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/overview/sections`,
        {
          headers: this.getAuthHeader(),
          cache: "no-store",
        }
      );
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Failed to fetch CMS sections:", error);
      throw error;
    }
  }

  async exportCMSData(format: "json" | "csv"): Promise<void> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/overview/export?format=${format}`,
        {
          method: "GET",
          headers: this.getAuthHeader(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export CMS data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cms-overview_${new Date().toISOString().split("T")[0]}.${format === "csv" ? "csv" : "json"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export CMS data:", error);
      throw error;
    }
  }
}

export const cmsOverviewService = new CMSOverviewService();
export default cmsOverviewService;
