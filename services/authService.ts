import api from "../api/api";

export const loginUser = async (email: string, password: string, userPushToken: string) => {
  try {
    const response = await api.post("/login", { email, password, userPushToken });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (userId: number, newPassword: string, confirmPassword: string) => {
  try {
    const response = await api.post("/change-password", { userId, newPassword, confirmPassword, });
    return response.data;
  } catch (error) {
    throw error;
  }
};
