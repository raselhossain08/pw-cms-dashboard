export interface Author {
    name: string;
    role: string;
    avatar: string;
    bio: string;
    socialLinks?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        website?: string;
    };
}

export interface BlogPost {
    title: string;
    excerpt: string;
    image: string;
    slug: string;
    featured: boolean;
    content: string;
    author: Author;
    publishedAt: string | Date;
    readTime: string;
    category: string;
    tags: string[];
    views: number;
    likes: number;
    commentsCount: number;
}

export interface SeoMeta {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
}

export interface Blog {
    _id?: string;
    title: string;
    subtitle: string;
    description: string;
    blogs: BlogPost[];
    seo: SeoMeta;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateBlogDto {
    title?: string;
    subtitle?: string;
    description?: string;
    blogs?: BlogPost[];
    seo?: SeoMeta;
    isActive?: boolean;
}

export interface BlogResponse {
    success: boolean;
    data: Blog;
    message?: string;
}
