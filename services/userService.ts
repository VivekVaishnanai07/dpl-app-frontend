import api from "@/api/api";

export const getUserDetails = async (userId: number) => {
  try {
    const response = await api.get(`/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserDetails = async (userId: number, payload: { id: number, first_name: string, last_name: string, userImg: String }) => {
  try {
    const response = await api.put(`/user/profile/${userId}`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const viewProfileUserDetails = async (userId: number) => {
  try {
    const response = await api.get(`/user/view-profile/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};