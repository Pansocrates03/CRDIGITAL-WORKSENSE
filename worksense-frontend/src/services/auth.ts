import axios from "axios";

const API_URL = "http://localhost:5050"; // Ajusta esto según tu configuración

interface LoginResponse {
  message: string;
  token: string;
  user: {
    username: string;
    roleId: number;
    roleName: string;
  };
}

interface User {
  username: string;
  userId: number;
  roleId: number;
  roleName: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      console.log("Intentando login con:", { username, password: "***" });
      const response = await axios.post(
        `${API_URL}/login`,
        {
          username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Respuesta del servidor:", response.data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      console.error("Error detallado en login:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(
        error.response?.data?.message || "Error en la autenticación"
      );
    }
  },

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser(): User | null {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        this.logout(); // Si hay error al parsear, limpiamos el storage
        return null;
      }
    }
    return null;
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
