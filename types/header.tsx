// src/types/header.ts
export interface Header {
  id: string;
  enabled: boolean;
  logo: {
    dark: string;
    light: string;
    alt: string;
  };
  cart: {
    itemCount: number;
    href: string;
    items: Array<{
      id: number;
      title: string;
      image: string;
      price: number;
      quantity: number;
      instructor: string;
    }>;
  };
  search: {
    placeholder: string;
    buttonText: string;
    resultsPerPage: number;
    mockResults: Array<{
      id: number;
      title: string;
      image: string;
      price: number;
      oldPrice?: number;
      rating: number;
      reviewCount: number;
    }>;
  };
  navigation: {
    menuItems: Array<{
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
      submenus?: Array<{
        title: string;
        icon: string;
        links: Array<{
          text: string;
          href: string;
          icon: string;
          description: string;
          badge?: string;
        }>;
      }>;
    }>;
  };
  userMenu: {
    profile: {
      name: string;
      email: string;
      avatar: string;
      avatarFallback: string;
      profileLink: string;
    };
    isLoggedIn: boolean;
    menuItems: Array<{
      icon: string;
      text: string;
      href: string;
      description?: string;
    }>;
    supportLinks: Array<{
      icon: string;
      text: string;
      href: string;
    }>;
    settingsLinks: Array<{
      icon: string;
      text: string;
      href: string;
    }>;
  };
  notifications: {
    enabled: boolean;
    items: Array<{
      id: number;
      title: string;
      message: string;
      type: string;
      isRead: boolean;
      time: string;
      link?: string;
      icon?: string;
    }>;
    viewAllLink: string;
  };
  theme: {
    enabled: boolean;
    defaultTheme: string;
  };
  announcement: {
    enabled: boolean;
    message: string;
    link?: string;
    linkText?: string;
    type: string;
    dismissible: boolean;
  };
  cta: {
    text: string;
    href: string;
    variant: string;
  };
  topBar: {
    enabled: boolean;
    backgroundColor: string;
    textColor: string;
    socialStats: {
      enabled: boolean;
      items: Array<{
        platform: string;
        count: string;
        label: string;
        href: string;
      }>;
    };
    news: {
      enabled: boolean;
      badge: string;
      text: string;
      icon?: string;
      link?: string;
    };
    socialLinks: {
      enabled: boolean;
      items: Array<{
        platform: string;
        href: string;
      }>;
    };
    language: {
      enabled: boolean;
      defaultLanguage: string;
      languages: Array<{
        code: string;
        name: string;
        flag: string;
      }>;
    };
    currency: {
      enabled: boolean;
      defaultCurrency: string;
      currencies: Array<{
        code: string;
        name: string;
      }>;
    };
    mobile: {
      expandable: boolean;
      showSocialStats: boolean;
      showSocialLinks: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export type CreateHeaderDto = Omit<Header, "id" | "createdAt" | "updatedAt">;
export type UpdateHeaderDto = Partial<CreateHeaderDto>;
