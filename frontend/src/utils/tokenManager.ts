const TOKEN_KEY = "access_token";
const SYNC_KEY = "token_sync"; // Backup key for refresh recovery

export const tokenManager = {
  /**
   * Save token to sessionStorage
   * Backup to localStorage for refresh recovery
   */
  setToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(SYNC_KEY, token);
  },

  /**
   * Get token (restore from localStorage if needed)
   * Returns null if missing or expired
   */
  getToken(): string | null {
    let token = sessionStorage.getItem(TOKEN_KEY);

    if (!token) {
      token = localStorage.getItem(SYNC_KEY);
      if (token && !this.isTokenExpired(token)) {
        sessionStorage.setItem(TOKEN_KEY, token);
      } else {
        this.removeToken();
        return null;
      }
    }

    if (this.isTokenExpired(token)) {
      this.removeToken();
      return null;
    }

    return token;
  },

  /**
   * Check JWT expiration
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(
        window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  },

  /**
   * Clear token from storage
   */
  removeToken(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SYNC_KEY);
  },

  /**
   * Whether a valid token exists
   */
  hasToken(): boolean {
    return !!this.getToken();
  },

  /**
   * Minutes remaining until expiration
   */
  getTokenTimeRemaining(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(
        window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      const remaining = payload.exp * 1000 - Date.now();
      return remaining > 0 ? Math.floor(remaining / 1000 / 60) : null;
    } catch {
      return null;
    }
  },
  /**
   * Clear the access token from sessionStorage
   */
  clearAuth(): void {
    this.removeToken();
    sessionStorage.removeItem("auth_user");
  },
};
