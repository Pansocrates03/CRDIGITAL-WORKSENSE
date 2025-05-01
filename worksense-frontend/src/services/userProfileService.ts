import apiClient from "@/api/apiClient";
import { User } from "@/types/UserType";
import { API_URL } from "../../config/env.config"

const FULL_API_URL = API_URL + "/api/v1";

export const userProfileService = {
  async fetchProfile(): Promise<User> {
    try {
      const response = await apiClient.get(`${FULL_API_URL}/me`);
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  async updateProfile(data: {
    nickName?: string;
    pfp?: string;
  }): Promise<User> {
    try {
      const response = await apiClient.put(`${FULL_API_URL}/me`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },
};
