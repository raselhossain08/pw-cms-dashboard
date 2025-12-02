export interface Testimonial {
    name: string;
    position: string;
    company: string;
    avatar: string;
    rating: number;
    comment: string;
    fallback: string;
}

export interface SeoMeta {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
}

export interface Testimonials {
    _id?: string;
    title: string;
    subtitle: string;
    description: string;
    testimonials: Testimonial[];
    seo: SeoMeta;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateTestimonialsDto {
    title?: string;
    subtitle?: string;
    description?: string;
    testimonials?: Testimonial[];
    seo?: SeoMeta;
    isActive?: boolean;
}

export interface TestimonialsResponse {
    success: boolean;
    data: Testimonials | null;
}
