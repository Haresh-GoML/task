const API_URL = import.meta.env.VITE_API_URL as string;

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

// Subscribe to token refresh completion
const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers after successful refresh
const onRefreshed = () => {
  refreshSubscribers.forEach((callback) => callback());
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

export const authService = {
  register: async (data: RegisterData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // credentials: "include" allows cookies to be sent/received
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  },

  login: async (data: LoginData) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Cookies (accessToken + refreshToken) are set by the server response
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  },

  // Refresh is triggered automatically by fetchWithAuth on 401.
  // No body needed — the server reads refreshToken from the HTTP-only cookie.
  refresh: async () => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Token refresh failed");
    }

    return response.json();
  },

  // No body needed — the server reads refreshToken from the HTTP-only cookie.
  logout: async () => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Logout failed");
    }

    return response.json();
  },

  // Called by AuthContext on mount to determine if the user is authenticated.
  // Since HTTP-only cookies are invisible to JS, this endpoint validates
  // the accessToken cookie server-side and returns the current user.
  // If the accessToken is expired (401), it attempts to refresh using refreshToken.
  me: async () => {
    let response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (response.status === 401) {
      try {
        await authService.refresh();
        response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
      } catch {
        throw new Error("Not authenticated");
      }
    }

    if (!response.ok) {
      throw new Error("Not authenticated");
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

// Enhanced fetch with automatic token refresh on 401.
// Tokens are carried automatically by the browser as HTTP-only cookies —
// the frontend never reads or attaches them manually.
const fetchWithAuth = async (url: string, options: RequestInit): Promise<Response> => {
  // Always include credentials so the browser sends auth cookies
  const requestOptions: RequestInit = {
    ...options,
    credentials: "include",
  };

  let response = await fetch(url, requestOptions);

  // If 401, attempt a silent token refresh then retry the original request
  if (response.status === 401) {
    // If already refreshing, queue this request until refresh completes
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          resolve(fetch(url, requestOptions));
        });
      });
    }

    isRefreshing = true;

    try {
      // Ask the server to refresh the access token using the refreshToken cookie.
      // On success the server sets a new accessToken cookie automatically.
      await authService.refresh();

      // Notify all queued requests that they can now retry
      onRefreshed();

      // Retry original request — browser will send the newly set accessToken cookie
      response = await fetch(url, requestOptions);
    } catch {
      // Refresh failed — redirect to login
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
      headers: {
        "Content-Type": "application/json",
      },
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
      headers: {
        "Content-Type": "application/json",
      },
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
      headers: {
        "Content-Type": "application/json",
      },
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
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete task");
    }

    return response.json();
  },
};
