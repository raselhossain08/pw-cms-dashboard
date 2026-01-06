import { apiClient } from '@/lib/api-client';

export interface SystemConfig {
    _id: string;
    key: string;
    value: string;
    category: string;
    label: string;
    description?: string;
    isSecret: boolean;
    isRequired: boolean;
    placeholder?: string;
    metadata?: Record<string, any>;
    isActive: boolean;
}

export interface GroupedConfigs {
    [category: string]: SystemConfig[];
}

export interface BulkUpdateConfig {
    key: string;
    value: string;
}

export interface SettingsData {
    // General Settings
    platformName?: string;
    platformUrl?: string;
    contactEmail?: string;
    supportPhone?: string;
    platformDesc?: string;
    timeZone?: string;
    dateFormat?: string;
    currency?: string;
    units?: string;
    defaultLanguage?: string;
    autoDetectLang?: boolean;
    availableLangs?: Record<string, boolean>;

    // Performance
    cachingEnabled?: boolean;
    imageOptimization?: boolean;
    cdnEnabled?: boolean;
    cacheDuration?: string;
    imageQuality?: string;

    // Security
    twoFactor?: boolean;
    passwordPolicy?: string;
    sslEnforce?: boolean;
    apiRateLimit?: boolean;
    sessionTimeout?: string;

    // Integrations
    shopifyConnected?: boolean;
    gaConnected?: boolean;
    emailServiceEnabled?: boolean;

    // Branding
    brandPrimary?: string;
    brandSecondary?: string;
    brandAccent?: string;
    logoUrl?: string;
    faviconUrl?: string;

    // Payments
    stripeEnabled?: boolean;
    paypalEnabled?: boolean;
    stripeConfig?: {
        publishableKey: string;
        secretKey: string;
        webhookSecret: string;
    };
    paypalConfig?: {
        clientId: string;
        clientSecret: string;
        mode: 'sandbox' | 'live';
    };
    invoicePrefix?: string;
    taxRate?: string;
    paymentCurrency?: string;

    // SEO
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    ogImage?: string;
    sitemapEnabled?: boolean;
    robotsIndex?: string;
    canonicalUrl?: string;

    // Backup
    backupFrequency?: string;
    retentionPeriod?: string;
    backupDestination?: string;
    encryptionEnabled?: boolean;

    // Notifications
    notificationPrefs?: {
        system: Array<{ id: string; enabled: boolean }>;
        emailMarketing?: Record<string, boolean>;
        emailEducation?: Record<string, boolean>;
        quietStart?: string;
        quietEnd?: string;
        days?: Record<string, boolean>;
        pushEnabled?: boolean;
        smsEnabled?: boolean;
    };
}

const BASE_URL = '/system-config';

export const settingsService = {
    /**
     * Get all system configurations
     */
    async getAll(): Promise<SystemConfig[]> {
        const response = await apiClient.get<SystemConfig[]>(BASE_URL);
        return response.data as SystemConfig[];
    },

    /**
     * Get grouped configurations by category
     */
    async getGrouped(): Promise<GroupedConfigs> {
        const response = await apiClient.get<GroupedConfigs>(`${BASE_URL}/grouped`);
        return response.data as GroupedConfigs;
    },

    /**
     * Get configurations by category
     */
    async getByCategory(category: string): Promise<SystemConfig[]> {
        const response = await apiClient.get<SystemConfig[]>(`${BASE_URL}?category=${category}`);
        return response.data as SystemConfig[];
    },

    /**
     * Get single configuration by key
     */
    async getByKey(key: string): Promise<SystemConfig> {
        const response = await apiClient.get<SystemConfig>(`${BASE_URL}/${key}`);
        return response.data as SystemConfig;
    },

    /**
     * Update single configuration
     */
    async updateConfig(key: string, value: string): Promise<SystemConfig> {
        const response = await apiClient.put<SystemConfig>(`${BASE_URL}/${key}`, { value });
        return response.data as SystemConfig;
    },

    /**
     * Bulk update configurations
     */
    async bulkUpdate(updates: BulkUpdateConfig[]): Promise<SystemConfig[]> {
        const response = await apiClient.put<SystemConfig[]>(`${BASE_URL}/bulk/update`, updates);
        return response.data as SystemConfig[];
    },

    /**
     * Create new configuration
     */
    async createConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
        const response = await apiClient.post<SystemConfig>(BASE_URL, config);
        return response.data as SystemConfig;
    },

    /**
     * Delete configuration
     */
    async deleteConfig(key: string): Promise<void> {
        await apiClient.delete(`${BASE_URL}/${key}`);
    },

    /**
     * Test connection for payment gateways
     */
    async testConnection(key: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.post<{ success: boolean; message: string }>(
            `${BASE_URL}/${key}/test`
        );
        return response.data as { success: boolean; message: string };
    },

    /**
     * Export settings as JSON
     */
    exportSettings(data: SettingsData): string {
        return JSON.stringify(data, null, 2);
    },

    /**
     * Import settings from JSON
     */
    importSettings(json: string): SettingsData {
        try {
            return JSON.parse(json) as SettingsData;
        } catch (error) {
            throw new Error('Invalid settings file format');
        }
    },

    /**
     * Map configs to settings data object
     */
    mapConfigsToSettings(configs: SystemConfig[]): Partial<SettingsData> {
        const settings: Partial<SettingsData> = {};

        configs.forEach((config) => {
            const { key, value } = config;

            try {
                switch (key) {
                    case 'platform_name':
                        settings.platformName = value;
                        break;
                    case 'platform_url':
                        settings.platformUrl = value;
                        break;
                    case 'contact_email':
                        settings.contactEmail = value;
                        break;
                    case 'support_phone':
                        settings.supportPhone = value;
                        break;
                    case 'platform_description':
                        settings.platformDesc = value;
                        break;
                    case 'timezone':
                        settings.timeZone = value;
                        break;
                    case 'date_format':
                        settings.dateFormat = value;
                        break;
                    case 'currency':
                        settings.currency = value;
                        break;
                    case 'units':
                        settings.units = value;
                        break;
                    case 'default_language':
                        settings.defaultLanguage = value;
                        break;
                    case 'auto_detect_language':
                        settings.autoDetectLang = value === 'true';
                        break;
                    case 'available_languages':
                        settings.availableLangs = JSON.parse(value || '{}');
                        break;
                    case 'caching_enabled':
                        settings.cachingEnabled = value === 'true';
                        break;
                    case 'image_optimization':
                        settings.imageOptimization = value === 'true';
                        break;
                    case 'cdn_enabled':
                        settings.cdnEnabled = value === 'true';
                        break;
                    case 'cache_duration':
                        settings.cacheDuration = value;
                        break;
                    case 'image_quality':
                        settings.imageQuality = value;
                        break;
                    case 'two_factor_auth':
                        settings.twoFactor = value === 'true';
                        break;
                    case 'password_policy':
                        settings.passwordPolicy = value;
                        break;
                    case 'ssl_enforce':
                        settings.sslEnforce = value === 'true';
                        break;
                    case 'api_rate_limit':
                        settings.apiRateLimit = value === 'true';
                        break;
                    case 'session_timeout':
                        settings.sessionTimeout = value;
                        break;
                    case 'shopify_connected':
                        settings.shopifyConnected = value === 'true';
                        break;
                    case 'ga_connected':
                        settings.gaConnected = value === 'true';
                        break;
                    case 'email_service_enabled':
                        settings.emailServiceEnabled = value === 'true';
                        break;
                    case 'brand_primary':
                        settings.brandPrimary = value;
                        break;
                    case 'brand_secondary':
                        settings.brandSecondary = value;
                        break;
                    case 'brand_accent':
                        settings.brandAccent = value;
                        break;
                    case 'logo_url':
                        settings.logoUrl = value;
                        break;
                    case 'favicon_url':
                        settings.faviconUrl = value;
                        break;
                    case 'stripe_enabled':
                        settings.stripeEnabled = value === 'true';
                        break;
                    case 'paypal_enabled':
                        settings.paypalEnabled = value === 'true';
                        break;
                    case 'stripe_config':
                        settings.stripeConfig = JSON.parse(value || '{}');
                        break;
                    case 'paypal_config':
                        settings.paypalConfig = JSON.parse(value || '{}');
                        break;
                    case 'invoice_prefix':
                        settings.invoicePrefix = value;
                        break;
                    case 'tax_rate':
                        settings.taxRate = value;
                        break;
                    case 'payment_currency':
                        settings.paymentCurrency = value;
                        break;
                    case 'seo_title':
                        settings.seoTitle = value;
                        break;
                    case 'seo_description':
                        settings.seoDescription = value;
                        break;
                    case 'seo_keywords':
                        settings.seoKeywords = value;
                        break;
                    case 'og_image':
                        settings.ogImage = value;
                        break;
                    case 'sitemap_enabled':
                        settings.sitemapEnabled = value === 'true';
                        break;
                    case 'robots_index':
                        settings.robotsIndex = value;
                        break;
                    case 'canonical_url':
                        settings.canonicalUrl = value;
                        break;
                    case 'backup_frequency':
                        settings.backupFrequency = value;
                        break;
                    case 'retention_period':
                        settings.retentionPeriod = value;
                        break;
                    case 'backup_destination':
                        settings.backupDestination = value;
                        break;
                    case 'encryption_enabled':
                        settings.encryptionEnabled = value === 'true';
                        break;
                    case 'notification_prefs':
                        settings.notificationPrefs = JSON.parse(value || '{}');
                        break;
                }
            } catch (error) {
                console.warn(`Failed to parse config ${key}:`, error);
            }
        });

        return settings;
    },

    /**
     * Map settings data to bulk update format
     */
    mapSettingsToBulkUpdate(settings: Partial<SettingsData>): BulkUpdateConfig[] {
        const updates: BulkUpdateConfig[] = [];

        Object.entries(settings).forEach(([key, value]) => {
            let configKey: string | null = null;
            let configValue: string = String(value);

            if (value === undefined || value === null) return;

            switch (key) {
                case 'platformName':
                    configKey = 'platform_name';
                    configValue = String(value);
                    break;
                case 'platformUrl':
                    configKey = 'platform_url';
                    configValue = String(value);
                    break;
                case 'contactEmail':
                    configKey = 'contact_email';
                    configValue = String(value);
                    break;
                case 'supportPhone':
                    configKey = 'support_phone';
                    configValue = String(value);
                    break;
                case 'platformDesc':
                    configKey = 'platform_description';
                    configValue = String(value);
                    break;
                case 'timeZone':
                    configKey = 'timezone';
                    configValue = String(value);
                    break;
                case 'dateFormat':
                    configKey = 'date_format';
                    configValue = String(value);
                    break;
                case 'currency':
                    configKey = 'currency';
                    configValue = String(value);
                    break;
                case 'units':
                    configKey = 'units';
                    configValue = String(value);
                    break;
                case 'defaultLanguage':
                    configKey = 'default_language';
                    configValue = String(value);
                    break;
                case 'autoDetectLang':
                    configKey = 'auto_detect_language';
                    configValue = String(value);
                    break;
                case 'availableLangs':
                    configKey = 'available_languages';
                    configValue = JSON.stringify(value);
                    break;
                case 'cachingEnabled':
                    configKey = 'caching_enabled';
                    configValue = String(value);
                    break;
                case 'imageOptimization':
                    configKey = 'image_optimization';
                    configValue = String(value);
                    break;
                case 'cdnEnabled':
                    configKey = 'cdn_enabled';
                    configValue = String(value);
                    break;
                case 'cacheDuration':
                    configKey = 'cache_duration';
                    configValue = String(value);
                    break;
                case 'imageQuality':
                    configKey = 'image_quality';
                    configValue = String(value);
                    break;
                case 'twoFactor':
                    configKey = 'two_factor_auth';
                    configValue = String(value);
                    break;
                case 'passwordPolicy':
                    configKey = 'password_policy';
                    configValue = String(value);
                    break;
                case 'sslEnforce':
                    configKey = 'ssl_enforce';
                    configValue = String(value);
                    break;
                case 'apiRateLimit':
                    configKey = 'api_rate_limit';
                    configValue = String(value);
                    break;
                case 'sessionTimeout':
                    configKey = 'session_timeout';
                    configValue = String(value);
                    break;
                case 'shopifyConnected':
                    configKey = 'shopify_connected';
                    configValue = String(value);
                    break;
                case 'gaConnected':
                    configKey = 'ga_connected';
                    configValue = String(value);
                    break;
                case 'emailServiceEnabled':
                    configKey = 'email_service_enabled';
                    configValue = String(value);
                    break;
                case 'brandPrimary':
                    configKey = 'brand_primary';
                    configValue = String(value);
                    break;
                case 'brandSecondary':
                    configKey = 'brand_secondary';
                    configValue = String(value);
                    break;
                case 'brandAccent':
                    configKey = 'brand_accent';
                    configValue = String(value);
                    break;
                case 'logoUrl':
                    configKey = 'logo_url';
                    configValue = String(value);
                    break;
                case 'faviconUrl':
                    configKey = 'favicon_url';
                    configValue = String(value);
                    break;
                case 'stripeEnabled':
                    configKey = 'stripe_enabled';
                    configValue = String(value);
                    break;
                case 'paypalEnabled':
                    configKey = 'paypal_enabled';
                    configValue = String(value);
                    break;
                case 'stripeConfig':
                    configKey = 'stripe_config';
                    configValue = JSON.stringify(value);
                    break;
                case 'paypalConfig':
                    configKey = 'paypal_config';
                    configValue = JSON.stringify(value);
                    break;
                case 'invoicePrefix':
                    configKey = 'invoice_prefix';
                    configValue = String(value);
                    break;
                case 'taxRate':
                    configKey = 'tax_rate';
                    configValue = String(value);
                    break;
                case 'paymentCurrency':
                    configKey = 'payment_currency';
                    configValue = String(value);
                    break;
                case 'seoTitle':
                    configKey = 'seo_title';
                    configValue = String(value);
                    break;
                case 'seoDescription':
                    configKey = 'seo_description';
                    configValue = String(value);
                    break;
                case 'seoKeywords':
                    configKey = 'seo_keywords';
                    configValue = String(value);
                    break;
                case 'ogImage':
                    configKey = 'og_image';
                    configValue = String(value);
                    break;
                case 'sitemapEnabled':
                    configKey = 'sitemap_enabled';
                    configValue = String(value);
                    break;
                case 'robotsIndex':
                    configKey = 'robots_index';
                    configValue = String(value);
                    break;
                case 'canonicalUrl':
                    configKey = 'canonical_url';
                    configValue = String(value);
                    break;
                case 'backupFrequency':
                    configKey = 'backup_frequency';
                    configValue = String(value);
                    break;
                case 'retentionPeriod':
                    configKey = 'retention_period';
                    configValue = String(value);
                    break;
                case 'backupDestination':
                    configKey = 'backup_destination';
                    configValue = String(value);
                    break;
                case 'encryptionEnabled':
                    configKey = 'encryption_enabled';
                    configValue = String(value);
                    break;
                case 'notificationPrefs':
                    configKey = 'notification_prefs';
                    configValue = JSON.stringify(value);
                    break;
            }

            if (configKey) {
                updates.push({ key: configKey, value: configValue });
            }
        });

        return updates;
    },
};
