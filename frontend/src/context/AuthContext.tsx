import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, verify auth state by calling /auth/me.
  // HTTP-only cookies are invisible to JS, so we ask the server whether
  // the current accessToken cookie is valid.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.me();
        setIsAuthenticated(true);
      } catch {
        // No valid session — user needs to log in
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Called after a successful login API response.
  // Tokens are already stored in HTTP-only cookies by the server.
  // We only need to update local auth state.
  const login = () => {
    setIsAuthenticated(true);
  };

  // Calls the logout API (server clears cookies), then updates local state.
  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the API call fails, clear local auth state
    } finally {
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
