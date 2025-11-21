// src/lib/api/footer-service.ts
import { apiClient } from './client';
import type { Footer, FooterUpdatePayload } from '@/types/footer';

export class FooterService {
    /**
     * Get the active footer (singleton)
     */
    async getActiveFooter(): Promise<Footer> {
        const response = await apiClient.get<Footer>('/footer/active');
        return response.data;
    }

    /**
     * Update the entire active footer
     */
    async updateActiveFooter(data: FooterUpdatePayload): Promise<Footer> {
        const response = await apiClient.patch<Footer>('/footer/active', data);
        return response.data;
    }

    /**
     * Update only the logo section
     */
    async updateLogo(logoData: { src: string; alt: string; width: number; height: number }): Promise<Footer> {
        // Debug logging for API call
        console.log('🌐 Footer API - updateLogo:', {
            logoData,
            srcPath: logoData.src,
            isValidPath: logoData.src.startsWith('/uploads/') || logoData.src.startsWith('http'),
            payload: { logo: logoData },
            timestamp: new Date().toISOString()
        });

        const response = await apiClient.patch<Footer>('/footer/active/logo', logoData);

        // Log the response
        console.log('✅ Footer API - updateLogo response:', {
            success: !!response.data,
            responseLogoSrc: response.data?.logo?.src,
            originalSrc: logoData.src,
            pathPreserved: logoData.src === response.data?.logo?.src,
            fullResponse: response.data,
            timestamp: new Date().toISOString()
        });

        return response.data;
    }

    /**
     * Update only the description section
     */
    async updateDescription(descriptionData: { text: string; enabled: boolean }): Promise<Footer> {
        const response = await apiClient.patch<Footer>('/footer/active/description', {
            description: descriptionData
        });
        return response.data;
    }

    /**
     * Update only the social media section
     */
    async updateSocialMedia(socialMediaData: any): Promise<Footer> {
        const response = await apiClient.patch<Footer>('/footer/active/social-media', {
            socialMedia: socialMediaData
        });
        return response.data;
    }

    /**
     * Update only the sections
     */
    async updateSections(sectionsData: any): Promise<Footer> {
        const response = await apiClient.patch<Footer>('/footer/active/sections', {
            sections: sectionsData
        });
        return response.data;
    }

    /**
     * Update only the newsletter section
     */
    async updateNewsletter(newsletterData: any): Promise<Footer> {
        const response = await apiClient.patch<Footer>('/footer/active/newsletter', {
            newsletter: newsletterData
        });
        return response.data;
    }

    /**
     * Update only the contact section
     */
    async updateContact(contactData: any): Promise<Footer> {
        const response = await apiClient.patch<Footer>('/footer/active/contact', {
            contact: contactData
        });
        return response.data;
    }

    /**
     * Update only the bottom links
     */
    async updateBottomLinks(bottomLinksData: any): Promise<Footer> {
        const response = await apiClient.patch<Footer>('/footer/active/bottom-links', {
            bottomLinks: bottomLinksData
        });
        return response.data;
    }

    /**
     * Update only the language selector
     */
    async updateLanguageSelector(languageSelectorData: any): Promise<Footer> {
        const response = await apiClient.patch<Footer>('/footer/active/language-selector', {
            languageSelector: languageSelectorData
        });
        return response.data;
    }

    /**
     * Update only the copyright section
     */
    async updateCopyright(copyrightData: any): Promise<Footer> {
        const response = await apiClient.patch<Footer>('/footer/active/copyright', {
            copyright: copyrightData
        });
        return response.data;
    }

    /**
     * Update only the stats section
     */
    async updateStats(statsData: any): Promise<Footer> {
        const response = await apiClient.patch<Footer>('/footer/active/stats', {
            stats: statsData
        });
        return response.data;
    }

    /**
     * Update only the styling section
     */
    async updateStyling(stylingData: any): Promise<Footer> {
        const response = await apiClient.patch<Footer>('/footer/active/styling', {
            styling: stylingData
        });
        return response.data;
    }

    /**
     * Update only the SEO section
     */
    async updateSEO(seoData: any): Promise<Footer> {
        const response = await apiClient.patch<Footer>('/footer/active/seo', {
            seo: seoData
        });
        return response.data;
    }

    /**
     * Toggle footer enabled/disabled
     */
    async toggleFooter(enabled: boolean): Promise<Footer> {
        const response = await apiClient.patch<Footer>('/footer/active/toggle', {
            enabled
        });
        return response.data;
    }
}

export const footerService = new FooterService();