import axios from "../axios";

export interface ContactInfo {
    email: string;
    location: string;
    phone?: string;
}

export interface ContactFormSection {
    badge: string;
    title: string;
    image: string;
    imageAlt?: string;
}

export interface MapSection {
    embedUrl: string;
    showMap: boolean;
}

export interface SeoMeta {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
    canonicalUrl?: string;
}

export interface Contact {
    _id: string;
    contactInfo: ContactInfo;
    contactFormSection?: ContactFormSection;
    formSection?: ContactFormSection; // Backend returns formSection
    mapSection: MapSection;
    isActive: boolean;
    seo?: SeoMeta;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateContactDto {
    contactInfo?: ContactInfo;
    contactFormSection?: ContactFormSection;
    mapSection?: MapSection;
    isActive?: boolean;
    seo?: SeoMeta;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const contactService = {
    // Get all contact data
    async getAll(): Promise<Contact[]> {
        try {
            const response = await axios.get<ApiResponse<ApiResponse<Contact[]>>>('/cms/contact');
            // Handle double-nested data structure from API
            return (response.data.data as any).data || response.data.data;
        } catch (error) {
            console.error("Failed to fetch contact data:", error);
            throw error;
        }
    },

    // Get active contact
    async getActive(): Promise<Contact | null> {
        try {
            const response = await axios.get<ApiResponse<ApiResponse<Contact>>>('/cms/contact/active');
            // Handle double-nested data structure from API
            return (response.data.data as any).data || response.data.data;
        } catch (error) {
            console.error("Failed to fetch active contact:", error);
            throw error;
        }
    },

    // Get default contact (creates if not exists)
    async getDefault(): Promise<Contact> {
        try {
            const response = await axios.get<ApiResponse<ApiResponse<Contact>>>('/cms/contact/default');
            // Handle double-nested data structure from API
            return (response.data.data as any).data || response.data.data;
        } catch (error) {
            console.error("Failed to fetch default contact:", error);
            throw error;
        }
    },

    // Get contact by ID
    async getById(id: string): Promise<Contact> {
        try {
            const response = await axios.get<ApiResponse<ApiResponse<Contact>>>(`/cms/contact/${id}`);
            // Handle double-nested data structure from API
            return (response.data.data as any).data || response.data.data;
        } catch (error) {
            console.error("Failed to fetch contact:", error);
            throw error;
        }
    },

    // Update contact
    async update(id: string, data: UpdateContactDto): Promise<Contact> {
        try {
            if (!id) {
                throw new Error("Invalid contact ID");
            }

            const payload: any = { ...data };

            if (payload.contactFormSection) {
                payload.formSection = payload.contactFormSection;
                delete payload.contactFormSection;
            }

            if (payload.seo) {
                const cleanedSeo: any = {};
                const entries = Object.entries(payload.seo as Record<string, string | undefined>);
                for (const [key, value] of entries) {
                    if (typeof value === 'string') {
                        const v = value.trim();
                        if (v) cleanedSeo[key] = v;
                    } else if (value !== undefined) {
                        cleanedSeo[key] = value;
                    }
                }
                payload.seo = Object.keys(cleanedSeo).length ? cleanedSeo : undefined;
            }

            const response = await axios.put<ApiResponse<ApiResponse<Contact>>>(`/cms/contact/${id}`, payload);
            // Handle double-nested data structure from API
            return (response.data.data as any).data || response.data.data;
        } catch (error) {
            console.error("Failed to update contact:", error);
            throw error;
        }
    },

    // Delete contact
    async delete(id: string): Promise<void> {
        try {
            await axios.delete(`/cms/contact/${id}`);
        } catch (error) {
            console.error("Failed to delete contact:", error);
            throw error;
        }
    },

    // Toggle active status
    async toggleActive(id: string): Promise<Contact> {
        try {
            const response = await axios.post<ApiResponse<ApiResponse<Contact>>>(`/cms/contact/${id}/toggle-active`, {});
            return (response.data.data as any).data || response.data.data;
        } catch (error) {
            console.error("Failed to toggle active status:", error);
            throw error;
        }
    },

    // Duplicate contact
    async duplicate(id: string): Promise<Contact> {
        try {
            const response = await axios.post<ApiResponse<ApiResponse<Contact>>>(`/cms/contact/${id}/duplicate`, {});
            return (response.data.data as any).data || response.data.data;
        } catch (error) {
            console.error("Failed to duplicate contact:", error);
            throw error;
        }
    },

    // Export contact
    async export(id: string, format: "json" | "pdf" = "json"): Promise<void> {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        let token = '';
        try {
            const { cookieService } = await import('@/lib/cookie.service');
            token = cookieService.get('token') || '';
        } catch {
            if (typeof window !== 'undefined') {
                token = localStorage.getItem('token') || '';
            }
        }

        const res = await fetch(`${API_BASE_URL}/cms/contact/${id}/export?format=${format}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to export contact');
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contact_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'json'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },
};
