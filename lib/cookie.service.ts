"use client";

type CookieOptions = {
    expires?: Date | number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
};

class CookieService {
    private defaultPath = "/";

    set(name: string, value: string, options: CookieOptions = {}): void {
        if (typeof document === "undefined") return;

        const {
            expires,
            path = this.defaultPath,
            domain,
            secure = true,
            sameSite = "lax",
        } = options;

        let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

        if (expires) {
            const expiresDate =
                expires instanceof Date
                    ? expires
                    : new Date(Date.now() + expires * 24 * 60 * 60 * 1000);
            cookieString += `; expires=${expiresDate.toUTCString()}`;
        }

        if (path) cookieString += `; path=${path}`;
        if (domain) cookieString += `; domain=${domain}`;
        if (secure) cookieString += "; secure";
        if (sameSite) cookieString += `; samesite=${sameSite}`;

        document.cookie = cookieString;
    }

    get(name: string): string | null {
        if (typeof document === "undefined") return null;

        const nameEQ = encodeURIComponent(name) + "=";
        const cookies = document.cookie.split(";");

        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            }
        }

        return null;
    }

    remove(name: string, options: Omit<CookieOptions, "expires"> = {}): void {
        this.set(name, "", {
            ...options,
            expires: new Date(0),
        });
    }

    has(name: string): boolean {
        return this.get(name) !== null;
    }

    setAuthToken(token: string, expiresInDays: number = 7): void {
        this.set("authToken", token, {
            expires: expiresInDays,
            secure: true,
            sameSite: "lax",
        });
    }

    getAuthToken(): string | null {
        return this.get("authToken");
    }

    removeAuthToken(): void {
        this.remove("authToken");
    }

    clearAuthCookies(): void {
        this.removeAuthToken();
    }
}

export const cookieService = new CookieService();
export default cookieService;
