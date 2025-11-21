// Admin Dashboard Header Types
export interface Header {
    _id?: string;
    enabled: boolean;
    logo: {
        dark: string;
        light: string;
        alt: string;
    };
    cart: Cart;
    search: any;
    navigation: {
        menuItems: MenuItem[];
    };
    userMenu: UserMenu;
    notifications: any;
    theme: Theme;
    language: any;
    announcement: any;
    cta: any;
    topBar: {
        enabled: boolean;
        backgroundColor: string;
        textColor: string;
        socialStats?: any;
        news?: {
            enabled: boolean;
            badge: string;
            text: string;
            icon?: string;
            link?: string;
        };
        socialLinks?: any;
        language?: any;
        currency?: any;
        mobile?: any;
    };
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
        ogImage?: string;
        ogType?: string;
        twitterCard?: string;
        canonicalUrl?: string;
        structuredData?: any;
    };
}

export interface Theme {
    enabled: boolean;
    defaultTheme: 'light' | 'dark' | 'system';
}

export interface Cart {
    itemCount: number;
    href: string;
    items: CartItem[];
}

export interface CartItem {
    id: number;
    title: string;
    image: string;
    price: number;
    quantity: number;
    instructor: string;
}

export interface UserMenu {
    profile: UserProfile;
    isLoggedIn: boolean;
    menuItems: UserMenuItem[];
    supportLinks: UserMenuLink[];
    settingsLinks: UserMenuLink[];
}

export interface UserProfile {
    name: string;
    email: string;
    avatar: string;
    avatarFallback: string;
    profileLink: string;
}

export interface UserMenuItem {
    icon: string;
    text: string;
    href: string;
    description: string;
}

export interface UserMenuLink {
    icon: string;
    text: string;
    href: string;
}

export interface MenuItem {
    title: string;
    href?: string;
    hasDropdown: boolean;
    icon: string;
    description?: string;
    featured?: {
        title: string;
        description: string;
        image: string;
        href: string;
        badge?: string;
    };
    submenus?: Submenu[];
}

export interface Submenu {
    title: string;
    icon: string;
    links: MenuLink[];
}

export interface MenuLink {
    text: string;
    href: string;
    icon: string;
    description: string;
    badge?: "New" | "Popular" | "Hot" | "Featured";
}

export interface UpdateHeaderDto {
    logo?: Header['logo'];
    topBar?: Header['topBar'];
    navigation?: Header['navigation'];
    seo?: Header['seo'];
    theme?: Header['theme'];
    cart?: Header['cart'];
    userMenu?: Header['userMenu'];
}
