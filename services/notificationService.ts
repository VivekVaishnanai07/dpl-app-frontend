import api from "@/api/api";

export const notificationHandler = async (userId: number, token: string, action: boolean) => {
  try {
    const response = await api.post("/notification/push-token", { userId, token, action });
    return response.data;
  } catch (error: any) {
    console.error(`Error handling push token (${action ? "registering" : "removing"}) in backend:`, error.response || error);
    return null;
  }
};

export const getNotifications = async (userId: number) => {
  try {
    const response = await api.get(`/notification/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching notifications from backend:", error.response || error);
    return null;
  }
};

export const readNotification = async (userId: number, notificationId: number) => {
  try {
    const response = await api.put(`/notification/${userId}/${notificationId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error marking notification as read:", error.response || error);
    return null;
  }
};

export const readAllNotifications = async (userId: number) => {
  try {
    const response = await api.put(`/notification/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error.response || error);
    return null;
  }
};

export const deleteNotification = async (userId: number, notificationId: number) => {
  try {
    const response = await api.delete(`/notification/${userId}/${notificationId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting notification:", error.response || error);
    return null;
  }
};

export const deleteAllNotifications = async (userId: number) => {
  try {
    const response = await api.delete(`/notification/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting all notifications:", error.response || error);
    return null;
  }
};