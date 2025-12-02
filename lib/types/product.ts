export interface Product {
    _id: string;
    title: string;
    slug: string;
    description: string;
    type: 'aircraft' | 'simulator' | 'equipment' | 'software' | 'service';
    status: 'draft' | 'published' | 'archived' | 'sold';
    price: number;
    currency: string;
    aircraftCategory?: 'single_engine' | 'multi_engine' | 'jet' | 'turboprop' | 'helicopter';
    manufacturer?: string;
    productModel?: string;
    year?: number;
    totalTime?: number;
    timeSinceOverhaul?: number;
    engineModel?: string;
    engineHorsepower?: number;
    avionics?: string;
    features?: string[];
    documentation?: string[];
    location?: string;
    locationDescription?: string;
    images: string[];
    seller: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        avatar?: string;
    } | string;
    isFeatured: boolean;
    rating: number;
    reviewCount: number;
    viewCount: number;
    inquiryCount: number;
    specifications?: {
        seats: number;
        cruiseSpeed: number;
        range: number;
        fuelCapacity: number;
        maxTakeoffWeight: number;
        usefulLoad: number;
    };
    maintenance?: {
        lastAnnual: Date | string;
        nextAnnual: Date | string;
        last100Hour?: Date | string;
        next100Hour?: Date | string;
        damageHistory: boolean;
        damageDescription?: string;
    };
    tags: string[];
    quantity: number;
    soldCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductFormData {
    title: string;
    slug: string;
    description: string;
    type: 'aircraft' | 'simulator' | 'equipment' | 'software' | 'service';
    status: 'draft' | 'published' | 'archived' | 'sold';
    price: number;
    currency?: string;
    aircraftCategory?: 'single_engine' | 'multi_engine' | 'jet' | 'turboprop' | 'helicopter';
    manufacturer?: string;
    productModel?: string;
    year?: number;
    totalTime?: number;
    timeSinceOverhaul?: number;
    engineModel?: string;
    engineHorsepower?: number;
    avionics?: string;
    features?: string[];
    documentation?: string[];
    location?: string;
    locationDescription?: string;
    images?: string[];
    isFeatured?: boolean;
    specifications?: {
        seats?: number;
        cruiseSpeed?: number;
        range?: number;
        fuelCapacity?: number;
        maxTakeoffWeight?: number;
        usefulLoad?: number;
    };
    maintenance?: {
        lastAnnual?: Date | string;
        nextAnnual?: Date | string;
        last100Hour?: Date | string;
        next100Hour?: Date | string;
        damageHistory?: boolean;
        damageDescription?: string;
    };
    tags?: string[];
    quantity?: number;
}
