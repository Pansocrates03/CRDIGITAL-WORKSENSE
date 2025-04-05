import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "../services/auth";

interface AuthContextType {
  user: User | null; // Use your User type or 'any' if necessary
  // isAuthenticated: boolean; // REMOVE THIS
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider.tsx
import { User } from "../services/auth"; // Import your User type

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // Use User type
  // const [isAuthenticated, setIsAuthenticated] = useState(false); // REMOVE THIS
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(
      "%%% [AuthProvider useEffect] MOUNTING / REFRESH CHECK STARTING %%%"
    );
    try {
      const userFromStorage = authService.getCurrentUser();
      console.log(
        "%%% [AuthProvider useEffect] User received from getCurrentUser():",
        userFromStorage
      );
      // Only need to set the user state
      setUser(userFromStorage); // Set to user object or null
    } catch (error) {
      console.error(
        "%%% [AuthProvider useEffect] CRITICAL ERROR during initial auth check:",
        error
      );
      setUser(null); // Ensure user is null on error
    } finally {
      console.log(
        "%%% [AuthProvider useEffect] FINALLY block. Setting loading to false."
      );
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    // setLoading(true); // Optional
    try {
      console.log("[AuthProvider] Calling authService.login...");
      // Login returns the response including the user now
      const loginResponse = await authService.login(username, password);
      console.log("[AuthProvider] authService.login finished.");

      if (loginResponse.user && loginResponse.token) {
        console.log(
          "[AuthProvider] User found in login response. Setting state."
        );
        setUser(loginResponse.user); // Set user directly from login response
        // No need to call getCurrentUser again here
        // No need to set isAuthenticated
      } else {
        // This case means login service call succeeded but response lacked user/token
        console.error(
          "[AuthProvider] Login response missing user or token. Logging out."
        );
        logout(); // Clean up
        throw new Error("Login succeeded but response data invalid.");
      }
    } catch (error) {
      console.error("[AuthProvider] Error during login process:", error);
      logout(); // Ensure cleanup on error
      throw error;
    } finally {
      // setLoading(false); // Optional
    }
  };

  const logout = () => {
    console.log("[AuthProvider] Logout called.");
    authService.logout();
    setUser(null); // Only need to clear user state
    // No need to set isAuthenticated
  };

  // Derive isAuthenticated directly for the context value
  const isAuthenticated = !!user; // True if user is not null, false otherwise

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
