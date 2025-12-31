// Authentication related TypeScript types and interfaces

// Login request payload
export interface LoginRequest {
  email: string;
  password: string;
}

// User information (returned from backend)
export interface UserInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  status_id: number;
}

// Login response from API
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserInfo;
}

// Auth context interface for global state management
export interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}