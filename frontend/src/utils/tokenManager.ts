const TOKEN_KEY = "access_token";

export const tokenManager = {
  /**
   * Save access token to sessionStorage
   */
  setToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Get access token from sessionStorage
   * Returns null if token is expired or doesn't exist
   */
  getToken(): string | null {
    const token = sessionStorage.getItem(TOKEN_KEY);

    if (!token) {
      return null;
    }

    // Check if token is expired
    if (this.isTokenExpired(token)) {
      this.removeToken();
      return null;
    }

    return token;
  },

  /**
   * Check if JWT token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      // Parse JWT payload (format: header.payload.signature)
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));

      // Get expiration time (in seconds) and convert to milliseconds
      const exp = payload.exp * 1000;

      // Check if current time is past expiration
      return Date.now() >= exp;
    } catch (error) {
      console.error("Error parsing token:", error);
      return true;
    }
  },

  /**
   * Remove access token from sessionStorage
   */
  removeToken(): void {
    sessionStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Check if valid token exists
   */
  hasToken(): boolean {
    return !!this.getToken();
  },

  /**
   * Get time remaining until token expires (in minutes)
   * Returns null if no token or token is expired
   */
  getTokenTimeRemaining(): number | null {
    const token = sessionStorage.getItem(TOKEN_KEY);

    if (!token) {
      return null;
    }

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));
      const exp = payload.exp * 1000;
      const remaining = exp - Date.now();

      if (remaining <= 0) {
        return null;
      }

      return Math.floor(remaining / 1000 / 60); // return minutes
    } catch (error) {
      return null;
    }
  },
};
