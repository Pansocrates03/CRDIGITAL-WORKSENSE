import apiClient from "@/api/apiClient";

const API_URL = "http://localhost:5050"; // Ajusta esto según tu configuración

export interface User {
  email: string;
  userId: number;
  firstName?: string;
  lastName?: string;
  gender?: string;
  fullName?: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log("Intentando login con:", { email, password: "***" });
      const response = await apiClient.post(
        `${API_URL}/login`,
        {
          email,
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
        const tokenToSet = response.data.token;
        const userToSet = response.data.user;
        console.log("Token to set:", tokenToSet);
        console.log("User data to set:", userToSet);

        try {
          localStorage.setItem("token", tokenToSet);
          console.log("Token SET attempt finished.");

          // Verify IMMEDIATELY after setting token
          console.log("Verification (token):", localStorage.getItem("token"));

          // Now try setting the user, wrapped in its own try-catch
          try {
            localStorage.setItem("user", JSON.stringify(userToSet));
            console.log("User SET attempt finished.");
            // Verify user immediately too
            console.log("Verification (user):", localStorage.getItem("user"));
          } catch (userStringifyError) {
            console.error(
              "!!! Error setting USER item in localStorage:",
              userStringifyError
            );
            // Decide if you want to REMOVE the token if user fails?
            // localStorage.removeItem("token");
          }
        } catch (tokenSetError) {
          console.error(
            "!!! Error setting TOKEN item in localStorage:",
            tokenSetError
          );
        }
      } else {
        console.log("Token was falsy in response data, not setting.");
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
    console.log("%%% [getCurrentUser] CALLED (Refresh Check) %%%"); // Add a unique identifier
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    console.log(
      `%%% [getCurrentUser] Raw token: ${token ? "Exists" : "MISSING"}`
    );
    console.log(`%%% [getCurrentUser] Raw user string: ${userStr}`);

    if (token && userStr && userStr !== "undefined" && userStr !== "null") {
      try {
        const parsedUser = JSON.parse(userStr);
        console.log(
          "%%% [getCurrentUser] Parse attempt successful. Parsed data:",
          parsedUser
        );
        // TIGHTEN VALIDATION: Check for essential properties
        if (
          parsedUser &&
          typeof parsedUser === "object" &&
          typeof parsedUser.email === "string" &&
          typeof parsedUser.userId === "number"
        ) {
          // Agregar fullName si firstName y lastName están presentes
          if (parsedUser.firstName && parsedUser.lastName) {
            parsedUser.fullName = `${parsedUser.firstName} ${parsedUser.lastName}`;
          }

          console.log(
            "%%% [getCurrentUser] VALIDATED as user object. Returning object."
          );
          return parsedUser as User;
        } else {
          console.warn(
            "%%% [getCurrentUser] Parsed data FAILED validation (not object or missing key fields):",
            parsedUser
          );
          return null; // Indicate failure
        }
      } catch (parseError) {
        console.error("%%% [getCurrentUser] JSON.parse FAILED:", parseError);
        return null; // Indicate failure
      }
    } else {
      console.warn(
        "%%% [getCurrentUser] Token or user string missing/invalid before parse."
      );
      return null;
    }
  },
  getToken(): string | null {
    return localStorage.getItem("token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
