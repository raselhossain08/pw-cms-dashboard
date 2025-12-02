export interface Highlight {
    icon: string;
    label: string;
    text: string;
}

export interface CTA {
    label: string;
    link: string;
}

export interface Stat {
    value: number;
    suffix: string;
    label: string;
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

export interface AboutSection {
    _id?: string;
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    highlights: Highlight[];
    cta: CTA;
    stats: Stat[];
    seo?: SeoMeta;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateAboutSectionDto {
    id?: string;
    title: string;
    subtitle: string;
    description: string;
    image?: string;
    highlights: Highlight[];
    cta: CTA;
    stats?: Stat[];
    seo?: SeoMeta;
    isActive?: boolean;
}

export interface UpdateAboutSectionDto {
    id?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    image?: string;
    highlights?: Highlight[];
    cta?: CTA;
    stats?: Stat[];
    seo?: SeoMeta;
    isActive?: boolean;
}
