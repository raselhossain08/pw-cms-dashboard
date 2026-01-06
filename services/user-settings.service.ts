import { apiClient } from '@/lib/api-client';

export interface NotificationPreferences {
    email?: {
        courseUpdates?: boolean;
        marketing?: boolean;
        security?: boolean;
        system?: boolean;
        promotions?: boolean;
        newsletter?: boolean;
        newMessages?: boolean;
        assignments?: boolean;
    };
    push?: {
        enabled?: boolean;
        courseUpdates?: boolean;
        marketing?: boolean;
        security?: boolean;
        system?: boolean;
        courseReminders?: boolean;
        liveSessionAlerts?: boolean;
    };
    inApp?: {
        enabled?: boolean;
        sound?: boolean;
    };
}

export interface PrivacySettings {
    profileVisibility?: 'public' | 'private' | 'friends';
    showEmail?: boolean;
    showPhone?: boolean;
    allowMessages?: boolean;
    showActivity?: boolean;
}

export interface ProfileStats {
    coursesEnrolled?: number;
    coursesCompleted?: number;
    certificatesEarned?: number;
    totalSpent?: number;
    lastLogin?: string;
}

export interface UserData {
    user: any;
    enrollments?: any[];
    certificates?: any[];
    orders?: any[];
    settings?: any;
}

/**
 * Service for managing user-specific settings and preferences
 */
export const userSettingsService = {
    /**
     * Get user notification preferences
     */
    async getNotificationPreferences(): Promise<NotificationPreferences> {
        try {
            const response = await apiClient.get<{ preferences: NotificationPreferences }>(
                '/users/notification-preferences'
            );
            return response.data?.preferences || {};
        } catch (error) {
            console.error('Failed to fetch notification preferences:', error);
            // Return default preferences
            return {
                email: {
                    courseUpdates: true,
                    marketing: false,
                    security: true,
                    system: true,
                },
                push: {
                    enabled: true,
                    courseUpdates: true,
                    security: true,
                    system: true,
                },
                inApp: {
                    enabled: true,
                    sound: true,
                },
            };
        }
    },

    /**
     * Update user notification preferences
     */
    async updateNotificationPreferences(
        preferences: NotificationPreferences
    ): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.patch(
                '/users/notification-preferences',
                preferences
            );
            return {
                success: true,
                message: 'Notification preferences updated successfully',
            };
        } catch (error) {
            console.error('Failed to update notification preferences:', error);
            throw new Error('Failed to update notification preferences');
        }
    },

    /**
     * Get user privacy settings
     */
    async getPrivacySettings(): Promise<PrivacySettings> {
        try {
            const response = await apiClient.get<{ settings: PrivacySettings }>(
                '/users/privacy-settings'
            );
            return response.data?.settings || {};
        } catch (error) {
            console.error('Failed to fetch privacy settings:', error);
            // Return default settings
            return {
                profileVisibility: 'public',
                showEmail: false,
                showPhone: false,
                allowMessages: true,
                showActivity: true,
            };
        }
    },

    /**
     * Update user privacy settings
     */
    async updatePrivacySettings(
        settings: PrivacySettings
    ): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.patch('/users/privacy-settings', settings);
            return {
                success: true,
                message: 'Privacy settings updated successfully',
            };
        } catch (error) {
            console.error('Failed to update privacy settings:', error);
            throw new Error('Failed to update privacy settings');
        }
    },

    /**
     * Get user profile statistics
     */
    async getProfileStats(): Promise<ProfileStats> {
        try {
            const response = await apiClient.get<{ stats: ProfileStats }>(
                '/users/profile/stats'
            );
            return response.data?.stats || {};
        } catch (error) {
            console.error('Failed to fetch profile stats:', error);
            return {
                coursesEnrolled: 0,
                coursesCompleted: 0,
                certificatesEarned: 0,
                totalSpent: 0,
            };
        }
    },

    /**
     * Export user data (GDPR compliance)
     */
    async exportUserData(): Promise<UserData> {
        try {
            const response = await apiClient.get<UserData>('/users/me/export-data');
            return response.data || {};
        } catch (error) {
            console.error('Failed to export user data:', error);
            throw new Error('Failed to export user data');
        }
    },

    /**
     * Download exported user data as JSON file
     */
    async downloadUserData(): Promise<void> {
        try {
            const data = await this.exportUserData();
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download user data:', error);
            throw new Error('Failed to download user data');
        }
    },

    /**
     * Send verification email
     */
    async sendVerificationEmail(): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.post('/users/me/send-verification-email');
            return {
                success: true,
                message: 'Verification email sent successfully',
            };
        } catch (error) {
            console.error('Failed to send verification email:', error);
            throw new Error('Failed to send verification email');
        }
    },

    /**
     * Generate API key for user
     */
    async generateApiKey(): Promise<string> {
        try {
            const response = await apiClient.post<{ apiKey: string }>('/users/api-key');
            return response.data?.apiKey || '';
        } catch (error) {
            console.error('Failed to generate API key:', error);
            throw new Error('Failed to generate API key');
        }
    },
};

