import { apiClient } from "@/lib/api-client";

export enum AircraftStatus {
    AVAILABLE = "Available",
    RESERVED = "Reserved",
    UNDER_CONTRACT = "Under Contract",
    SOLD = "Sold",
}

export enum AircraftType {
    PISTON_SINGLE = "Piston Single",
    PISTON_MULTI = "Piston Multi",
    TURBOPROP = "Turboprop",
    BUSINESS_JET = "Business Jet",
    HELICOPTER = "Helicopter",
}

export interface Aircraft {
    _id: string;
    id?: string;
    title: string;
    modelYear: string;
    manufacturer: string;
    type: AircraftType;
    status: AircraftStatus;
    price: number;
    hours: string;
    location: string;
    engine?: string;
    avionics?: string;
    imageUrl?: string;
    images?: string[];
    description?: string;
    features?: string[];
    negotiable: boolean;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    views: number;
    inquiries: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface AircraftFilters {
    type?: AircraftType | "All Types";
    status?: AircraftStatus | "All Status";
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface AircraftPaginatedResponse {
    data: Aircraft[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface CreateAircraftDto {
    title: string;
    modelYear: string;
    manufacturer: string;
    type: AircraftType;
    status?: AircraftStatus;
    price: number;
    hours: string;
    location: string;
    engine?: string;
    avionics?: string;
    imageUrl?: string;
    images?: string[];
    description?: string;
    features?: string[];
    negotiable?: boolean;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
}

export interface UpdateAircraftDto extends Partial<CreateAircraftDto> { }

export interface AircraftStatistics {
    totalListings: number;
    statusBreakdown: {
        available: number;
        reserved: number;
        underContract: number;
        sold: number;
    };
    totalValue: number;
    byType: Array<{
        _id: string;
        count: number;
        avgPrice: number;
    }>;
}

export const aircraftService = {
    /**
     * Get all aircraft with optional filters and pagination
     */
    async getAircraft(filters?: AircraftFilters): Promise<AircraftPaginatedResponse> {
        const params = new URLSearchParams();

        if (filters?.type && filters.type !== "All Types") {
            params.append("type", filters.type);
        }
        if (filters?.status && filters.status !== "All Status") {
            params.append("status", filters.status);
        }
        if (filters?.search) {
            params.append("search", filters.search);
        }
        if (filters?.minPrice !== undefined) {
            params.append("minPrice", filters.minPrice.toString());
        }
        if (filters?.maxPrice !== undefined) {
            params.append("maxPrice", filters.maxPrice.toString());
        }
        if (filters?.page) {
            params.append("page", filters.page.toString());
        }
        if (filters?.limit) {
            params.append("limit", filters.limit.toString());
        }
        if (filters?.sortBy) {
            params.append("sortBy", filters.sortBy);
        }
        if (filters?.sortOrder) {
            params.append("sortOrder", filters.sortOrder);
        }

        const response = await apiClient.get<AircraftPaginatedResponse>(
            `/aircraft?${params.toString()}`
        );
        return response.data;
    },

    /**
     * Get a single aircraft by ID
     */
    async getAircraftById(id: string): Promise<Aircraft> {
        const response = await apiClient.get<Aircraft>(`/aircraft/${id}`);
        return response.data;
    },

    /**
     * Create a new aircraft listing
     */
    async createAircraft(data: CreateAircraftDto): Promise<Aircraft> {
        const response = await apiClient.post<Aircraft>("/aircraft", data);
        return response.data;
    },

    /**
     * Update an existing aircraft listing
     */
    async updateAircraft(id: string, data: UpdateAircraftDto): Promise<Aircraft> {
        const response = await apiClient.patch<Aircraft>(`/aircraft/${id}`, data);
        return response.data;
    },

    /**
     * Delete an aircraft listing
     */
    async deleteAircraft(id: string): Promise<void> {
        await apiClient.delete(`/aircraft/${id}`);
    },

    /**
     * Increment view count for an aircraft
     */
    async incrementViews(id: string): Promise<Aircraft> {
        const response = await apiClient.patch<Aircraft>(`/aircraft/${id}/view`);
        return response.data;
    },

    /**
     * Increment inquiry count for an aircraft
     */
    async incrementInquiries(id: string): Promise<Aircraft> {
        const response = await apiClient.patch<Aircraft>(`/aircraft/${id}/inquiry`);
        return response.data;
    },

    /**
     * Get aircraft statistics
     */
    async getStatistics(): Promise<AircraftStatistics> {
        const response = await apiClient.get<AircraftStatistics>("/aircraft/statistics");
        return response.data;
    },
};
