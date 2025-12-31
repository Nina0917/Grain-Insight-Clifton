import axios from 'axios';
import { LoginResponse, UserInfo } from '../types/auth';
import { tokenManager } from '../utils/tokenManager';

// Backend API base URL
const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically add JWT token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid or expired, redirect to login
    if (error.response?.status === 401) {
      tokenManager.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication service methods
export const authService = {
  /**
   * @param email - User's email address
   * @param password - User's password
   * @returns Login response with token and user info
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);  
    formData.append('password', password);
    formData.append('grant_type', 'password');  
    
    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/auth/token`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    // Save token to localStorage
    tokenManager.setToken(response.data.access_token);
    
    return response.data;
  },

  /**
   * Get current authenticated user information
   * @returns Current user's information
   */
  async getCurrentUser(): Promise<UserInfo> {
    const response = await apiClient.get<UserInfo>('/auth/me');
    return response.data;
  },

  /**
   * Logout user by removing token
   */
  logout(): void {
    tokenManager.removeToken();
  },
};

export default apiClient;