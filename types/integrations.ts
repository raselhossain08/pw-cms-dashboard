export enum IntegrationStatus {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    PENDING = 'pending',
}

export enum IntegrationCategory {
    PAYMENT_GATEWAYS = 'Payment Gateways',
    COMMUNICATION = 'Communication',
    MARKETING = 'Marketing',
    ANALYTICS = 'Analytics',
    DEVELOPER_TOOLS = 'Developer Tools',
}

export interface IntegrationStat {
    label: string;
    value: string;
}

export interface Integration {
    id: string;
    name: string;
    slug?: string;
    category: IntegrationCategory;
    description: string;
    status: IntegrationStatus;
    logo?: string;
    config?: Record<string, any>;
    stats?: IntegrationStat[];
    credentials?: Record<string, any>;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateIntegrationDto {
    name: string;
    slug?: string;
    category: IntegrationCategory;
    description: string;
    status?: IntegrationStatus;
    logo?: string;
    config?: Record<string, any>;
    stats?: IntegrationStat[];
    credentials?: Record<string, any>;
    isActive?: boolean;
    sortOrder?: number;
}

export interface UpdateIntegrationDto extends Partial<CreateIntegrationDto> { }

export interface IntegrationConfigDto {
    config?: Record<string, any>;
    credentials?: Record<string, any>;
    status?: IntegrationStatus;
}

export interface IntegrationStats {
    total: number;
    connected: number;
    disconnected: number;
    pending: number;
}

export interface IntegrationQuery {
    search?: string;
    category?: string;
    status?: IntegrationStatus;
}

export interface IntegrationTestResult {
    success: boolean;
    message: string;
}
