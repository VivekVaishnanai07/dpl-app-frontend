import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { loginUser } from "../services/authService";

export const authenticate = async (email: string, password: string, userPushToken: string) => {
  try {
    const data = await loginUser(email, password, userPushToken);
    if (data.token) {
      await AsyncStorage.setItem("isToken", data.token);
    }
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem("isToken");
};

export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem("isToken");
  return token !== null;
};

export const decodeJWT = async () => {
  try {
    const token = await AsyncStorage.getItem("isToken");

    if (!token) {
      console.warn("No token found in AsyncStorage");
      return null;
    }

    return jwtDecode(token); // Decodes token and returns payload (JSON)
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};