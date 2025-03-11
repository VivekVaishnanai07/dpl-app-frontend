import CustomSwipeCard from "@/components/CustomSwipeCrad";
import Colors from "@/constants/Colors";
import { useNotifications } from "@/context/NotificationContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useTheme } from "@/context/ThemeContext";
import { deleteNotification, readNotification } from "@/services/notificationService";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

const NotificationsScreen = () => {
  const { theme } = useTheme();
  const { notifications, fetchNotifications } = useNotifications();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchNotifications();
  }, [])

  // Function to remove a notification (when swiped left)
  const handleDelete = async (data: any) => {
    try {
      const response = await deleteNotification(data.user_id, data.id);
      if (response.message) {
        showSnackbar(response.message);
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Function to mark a notification as read (when swiped right)
  const handleMarkAsRead = async (data: any) => {
    try {
      const response = await readNotification(data.user_id, data.id);
      if (response.message) {
        showSnackbar(response.message);
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].tabBarIndicator }]}>
      <View style={{ flex: 1, backgroundColor: Colors[theme].greyBackground, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 16 }}>
        {
          notifications && notifications.length > 0 ? (
            <CustomSwipeCard
              notifications={notifications}
              onDelete={handleDelete}
              onMarkAsRead={handleMarkAsRead} />
          ) : (
            <Image source={require('../assets/images/no-notification.png')} style={{ height: 300, width: 350, margin: "auto" }} />
          )
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  customizeContainer: {
    alignItems: "center",
  },
  card: {
    marginBottom: 10,
    borderRadius: 18,
    borderWidth: 0,
    backgroundColor: "#fff",
    elevation: 8
  },
  cardTitle: {
    fontFamily: "Poppins-Medium"
  },
  date: {
    fontSize: 12,
    color: "gray",
    marginRight: 10,
  },
  message: {
    marginTop: 5,
    fontSize: 14,
    color: "#333",
  },
  missingContainer: {
    alignItems: "center",
    padding: 20,
  },
  missingText: {
    fontSize: 14,
    color: "gray",
  },
});

export default NotificationsScreen;