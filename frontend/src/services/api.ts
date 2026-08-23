const API_URL = import.meta.env.VITE_API_URL as string;

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Subscribe to token refresh
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers when token is refreshed
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// ==========================
// AUTH SERVICE
// ==========================

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  },

  refresh: async (refreshToken: string) => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Token refresh failed");
    }

    return response.json();
  },

  logout: async (refreshToken: string) => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Logout failed");
    }

    return response.json();
  },
};

// ==========================
// TASK SERVICE
// ==========================

export interface Task {
  _id: string;
  title: string;
  done: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
}

export interface UpdateTaskData {
  title?: string;
  done?: boolean;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Enhanced fetch with automatic token refresh on 401
const fetchWithAuth = async (url: string, options: RequestInit): Promise<Response> => {
  let response = await fetch(url, options);

  // If 401 and we have a refresh token, try to refresh
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    
    if (!refreshToken) {
      // No refresh token, user needs to login
      throw new Error("Authentication required");
    }

    // If already refreshing, wait for it to complete
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken: string) => {
          // Retry original request with new token
          const newHeaders = {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          } as HeadersInit;
          
          resolve(fetch(url, { ...options, headers: newHeaders }));
        });
      });
    }

    // Start refresh process
    isRefreshing = true;

    try {
      const refreshResponse = await authService.refresh(refreshToken);
      const newAccessToken = refreshResponse.accessToken;

      // Store new access token
      localStorage.setItem("accessToken", newAccessToken);

      // Notify all waiting requests
      onRefreshed(newAccessToken);

      // Retry original request with new token
      const newHeaders = {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
      } as HeadersInit;

      response = await fetch(url, { ...options, headers: newHeaders });
    } catch (error) {
      // Refresh failed, clear tokens and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    } finally {
      isRefreshing = false;
    }
  }

  return response;
};

export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    const response = await fetchWithAuth(`${API_URL}/tasks`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch tasks");
    }

    return response.json();
  },

  createTask: async (data: CreateTaskData): Promise<Task> => {
    const response = await fetchWithAuth(`${API_URL}/tasks`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create task");
    }

    return response.json();
  },

  updateTask: async (id: string, data: UpdateTaskData): Promise<Task> => {
    const response = await fetchWithAuth(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update task");
    }

    return response.json();
  },

  deleteTask: async (id: string): Promise<void> => {
    const response = await fetchWithAuth(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete task");
    }

    return response.json();
  },
};

