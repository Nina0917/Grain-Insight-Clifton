// Token management utility for localStorage operations

const TOKEN_KEY = 'access_token';

export const tokenManager = {
  /**
   * Get token from localStorage
   * @returns Token string or null if not found
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Save token to localStorage
   * @param token - JWT token to store
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Remove token from localStorage
   */
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Check if token exists in localStorage
   * @returns true if token exists, false otherwise
   */
  hasToken(): boolean {
    return !!this.getToken();
  }
};