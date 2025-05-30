import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, User } from "../services/auth";

interface AuthContextType {
  user: User | null; // Use your User type or 'any' if necessary
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // Use User type
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userFromStorage = authService.getCurrentUser();
      setUser(userFromStorage); // Set to user object or null
    } catch (error) {
      console.error(
        "%%% [AuthProvider useEffect] CRITICAL ERROR during initial auth check:",
        error
      );
      setUser(null); // Ensure user is null on error
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const loginResponse = await authService.login(email, password);

      if (loginResponse.user && loginResponse.token) {
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

  const isAuthenticated = !!user;

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
