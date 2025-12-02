export interface SeoMeta {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
    canonicalUrl?: string;
}

export interface Banner {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnail: string;
    alt: string;
    link: string;
    order: number;
    isActive: boolean;
    seo?: SeoMeta;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBannerDto {
    title: string;
    description: string;
    videoUrl: string;
    thumbnail: string;
    alt: string;
    link: string;
    order?: number;
    isActive?: boolean;
    seo?: SeoMeta;
}

export interface UpdateBannerDto {
    title?: string;
    description?: string;
    videoUrl?: string;
    thumbnail?: string;
    alt?: string;
    link?: string;
    order?: number;
    isActive?: boolean;
    seo?: SeoMeta;
}
