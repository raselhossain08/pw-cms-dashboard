// CMS Header Types
export interface Logo {
    dark: string;
    light: string;
    alt: string;
}

export interface Cart {
    href: string;
}

export interface SearchConfig {
    placeholder: string;
    buttonText: string;
    resultsPerPage: number;
}

export interface NavigationLink {
    text: string;
    href: string;
    icon: string;
    description: string;
    badge?: string;
}

export interface Submenu {
    title: string;
    icon: string;
    links: NavigationLink[];
}

export interface FeaturedCourse {
    title: string;
    description: string;
    image: string;
    href: string;
    badge: string;
}

export interface MenuItem {
    title: string;
    href?: string;
    hasDropdown: boolean;
    icon: string;
    description?: string;
    featured?: FeaturedCourse;
    submenus?: Submenu[];
}

export interface Navigation {
    menuItems: MenuItem[];
}

export interface UserProfile {
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

export interface UserMenu {
    profile: UserProfile;
    isLoggedIn: boolean;
    menuItems: UserMenuItem[];
    supportLinks: UserMenuLink[];
    settingsLinks: UserMenuLink[];
}

export interface CallToAction {
    text: string;
    href: string;
    variant: string;
}

export interface SeoConfig {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
    ogUrl: string;
    ogType: string;
    twitterCard: string;
    twitterSite: string;
    canonicalUrl: string;
    locale: string;
}

export interface HeaderNavigation {
    _id?: string;
    logo: Logo;
    cart: Cart;
    search: SearchConfig;
    navigation: Navigation;
    userMenu: UserMenu;
    cta: CallToAction;
    seo: SeoConfig;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// CMS Top Bar Types
export interface SocialStat {
    platform: string;
    href: string;
    count: string;
    label?: string;
}

export interface Language {
    code: string;
    name: string;
    flag: string;
}

export interface Currency {
    code: string;
    name: string;
    symbol?: string;
}

export interface NewsAnnouncement {
    badge: string;
    text: string;
    icon: string;
    link?: string;
}

export interface SocialLink {
    platform: string;
    href: string;
}

export interface TopBar {
    _id?: string;
    socialStats: SocialStat[];
    languages: Language[];
    currencies: Currency[];
    news: NewsAnnouncement;
    socialLinks: SocialLink[];
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// CMS Footer Types
export interface FooterLogo {
    src: string;
    publicId?: string;
    alt: string;
    width: number;
    height: number;
}

export interface FooterSocialLink {
    platform: string;
    href: string;
    label: string;
}

export interface FooterSocialMedia {
    title: string;
    links: FooterSocialLink[];
}

export interface FooterSectionLink {
    label: string;
    href: string;
}

export interface FooterSection {
    title: string;
    links: FooterSectionLink[];
}

export interface FooterNewsletter {
    title: string;
    description: string;
    placeholder: string;
    buttonText: string;
}

export interface FooterContact {
    phone: string;
    phoneHref: string;
    email: string;
    emailHref: string;
    address: string;
    hours: string;
}

export interface FooterBottomLink {
    label: string;
    href: string;
}

export interface FooterLanguage {
    code: string;
    name: string;
}

export interface FooterLanguageSelector {
    currentLanguage: string;
    languages: FooterLanguage[];
}

export interface FooterCompanyInfo {
    description: string;
    foundedYear: string;
    companyName: string;
    rightsText: string;
    contactLink: string;
}

export interface Footer {
    _id?: string;
    logo: FooterLogo;
    socialMedia: FooterSocialMedia;
    sections: FooterSection[];
    newsletter: FooterNewsletter;
    contact: FooterContact;
    bottomLinks: FooterBottomLink[];
    languageSelector: FooterLanguageSelector;
    companyInfo: FooterCompanyInfo;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: {
        timestamp: string;
        path: string;
        method: string;
    };
}
