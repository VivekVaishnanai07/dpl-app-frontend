import { deleteAllNotifications, getNotifications, readAllNotifications } from "@/services/notificationService";
import { decodeJWT } from "@/services/tokenService";
import { createContext, useContext, useEffect, useState } from "react";
import { useSnackbar } from "./SnackbarContext";

const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState([]);
  const { showSnackbar } = useSnackbar();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const user: any = await decodeJWT();

      // Prevent API call if no user is found
      if (!user || !user.id) {
        console.warn("User not logged in. Skipping notifications fetch.");
        return;
      }

      const response = await getNotifications(user.id);
      setNotifications(response);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const user: any = await decodeJWT();
      if (user) {
        const response = await readAllNotifications(user.id);
        if (response.message) {
          showSnackbar(response.message);
          fetchNotifications();
        }
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Delete all notifications
  const deleteAll = async () => {
    try {
      const user: any = await decodeJWT();
      if (user) {
        const response = await deleteAllNotifications(user.id);
        if (response.message) {
          showSnackbar(response.message);
          fetchNotifications();
        }
      }
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, fetchNotifications, markAllAsRead, deleteAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
