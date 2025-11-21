// Footer types based on the provided JSON structure
export interface FooterLogo {
    src: string;
    alt: string;
    width: number;
    height: number;
    _id?: string;
}

export interface FooterDescription {
    text: string;
    enabled: boolean;
    _id?: string;
}

export interface SocialMediaLink {
    platform: string;
    href: string;
    label: string;
    icon: string;
    _id?: string;
}

export interface SocialMedia {
    title: string;
    enabled: boolean;
    links: SocialMediaLink[];
    _id?: string;
}

export interface SectionLink {
    label: string;
    href: string;
    _id?: string;
}

export interface FooterSection {
    title: string;
    links: SectionLink[];
    _id?: string;
}

export interface Newsletter {
    title: string;
    description: string;
    placeholder: string;
    buttonText: string;
    enabled: boolean;
    _id?: string;
}

export interface ContactPhone {
    number: string;
    display: string;
    enabled: boolean;
    _id?: string;
}

export interface ContactEmail {
    address: string;
    enabled: boolean;
    _id?: string;
}

export interface ContactAddress {
    street: string;
    city: string;
    state: string;
    zip: string;
    enabled: boolean;
    _id?: string;
}

export interface ContactHours {
    weekday: string;
    weekend: string;
    enabled: boolean;
    _id?: string;
}

export interface Contact {
    phone: ContactPhone;
    email: ContactEmail;
    address: ContactAddress;
    hours: ContactHours;
    _id?: string;
}

export interface BottomLink {
    label: string;
    href: string;
    _id?: string;
}

export interface Language {
    code: string;
    name: string;
    flag: string;
    _id?: string;
}

export interface LanguageSelector {
    enabled: boolean;
    currentLanguage: string;
    languages: Language[];
    _id?: string;
}

export interface CopyrightContactLink {
    text: string;
    href: string;
}

export interface Copyright {
    startYear: number;
    companyName: string;
    rightsText: string;
    contactLink: CopyrightContactLink;
    _id?: string;
}

export interface FooterStat {
    value: number;
    suffix: string;
    label: string;
    _id?: string;
}

export interface FooterStyling {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    borderColor: string;
    paddingTop: number;
    paddingBottom: number;
    _id?: string;
}

export interface FooterAriaLabels {
    footer: string;
    socialLinks: string;
    newsletter: string;
    sections: string;
    bottomLinks: string;
}

export interface FooterAccessibility {
    ariaLabels: FooterAriaLabels;
    _id?: string;
}

export interface FooterSchema {
    "@context": string;
    "@type": string;
    name: string;
    url: string;
    logo: string;
    contactPoint: {
        "@type": string;
        telephone: string;
        contactType: string;
        email: string;
    };
    address: {
        "@type": string;
        streetAddress: string;
        addressLocality: string;
        addressRegion: string;
        postalCode: string;
        addressCountry: string;
    };
    sameAs: string[];
}

export interface FooterSEO {
    footerSchema: FooterSchema | null;
    accessibility: FooterAccessibility;
    _id?: string;
}

export interface Footer {
    _id?: string;
    enabled: boolean;
    logo: FooterLogo;
    description: FooterDescription;
    socialMedia: SocialMedia;
    sections: FooterSection[];
    newsletter: Newsletter;
    contact: Contact;
    bottomLinks: BottomLink[];
    languageSelector: LanguageSelector;
    copyright: Copyright;
    stats: FooterStat[];
    styling: FooterStyling;
    seo: FooterSEO;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

// Form types for editing
export interface FooterLogoForm {
    src: string;
    alt: string;
    width: number;
    height: number;
}

export interface FooterDescriptionForm {
    text: string;
    enabled: boolean;
}

export interface SocialMediaForm {
    title: string;
    enabled: boolean;
    links: SocialMediaLink[];
}

export interface NewsletterForm {
    title: string;
    description: string;
    placeholder: string;
    buttonText: string;
    enabled: boolean;
}

export interface ContactForm {
    phone: {
        number: string;
        display: string;
        enabled: boolean;
    };
    email: {
        address: string;
        enabled: boolean;
    };
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        enabled: boolean;
    };
    hours: {
        weekday: string;
        weekend: string;
        enabled: boolean;
    };
}

export interface SectionsForm {
    sections: FooterSection[];
}

export interface BottomLinksForm {
    bottomLinks: BottomLink[];
}

export interface LanguageSelectorForm {
    enabled: boolean;
    currentLanguage: string;
    languages: Language[];
}

export interface CopyrightForm {
    startYear: number;
    companyName: string;
    rightsText: string;
    contactLink: CopyrightContactLink;
}

export interface StatsForm {
    stats: FooterStat[];
}

export interface StylingForm {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    borderColor: string;
    paddingTop: number;
    paddingBottom: number;
}

export interface SEOForm {
    footerSchema: FooterSchema | null;
    accessibility: FooterAccessibility;
}

// API response types
export interface FooterResponse {
    success: boolean;
    data: Footer;
    message?: string;
}

export interface FootersResponse {
    success: boolean;
    data: Footer[];
    message?: string;
}

// Update types
export type FooterUpdatePayload = Partial<Footer>;
export type FooterCreatePayload = Omit<Footer, '_id' | 'createdAt' | 'updatedAt' | '__v'>;