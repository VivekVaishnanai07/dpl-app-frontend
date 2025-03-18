import { useSnackbar } from "@/context/SnackbarContext";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { notificationHandler } from "@/services/notificationService";
import { logout } from "@/services/tokenService";
import { Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Avatar, List, Switch, Text } from "react-native-paper";

const SettingsScreen = () => {
  const { theme, toggleTheme, followSystem, toggleFollowSystem } = useTheme();
  const { user, fetchUserData } = useUser();
  const { showSnackbar } = useSnackbar();
  const navigation = useNavigation<any>();
  const router = useRouter();

  const [notifications, setNotifications] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");
  const [isFollowSystem, setIsFollowSystem] = useState(followSystem);

  useEffect(() => {
    setIsDarkMode(theme === "dark");
    setIsFollowSystem(followSystem);
    const checkStoredToken = async () => {
      const storedToken = await AsyncStorage.getItem("expoPushToken");
      setNotifications(!!storedToken);
    };
    if (!user) {
      fetchUserData();
    }
    checkStoredToken();
  }, [theme, followSystem])

  const handleNavigation = useCallback(
    (routeName: string, params?: any) => {
      if (isNavigating) return;

      setIsNavigating(true);
      navigation.push(routeName, params);

      setTimeout(() => setIsNavigating(false), 1000);
    },
    [isNavigating, navigation]
  );

  // Dynamic colors
  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "card");

  const handlerNotification = async () => {
    let token = await AsyncStorage.getItem("expoPushToken");
    if (!notifications) {
      // Enable Notifications
      if (!Device.isDevice) {
        Alert.alert("Error", "Must use a physical device for push notifications");
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert("Error", "Failed to get push token!");
        return;
      }

      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) throw new Error("Project ID not found");

        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        await AsyncStorage.setItem("expoPushToken", token);

        const response: any = await notificationHandler(user.id, token, true);
        if (response) {
          showSnackbar("The notification has been turned on successfully.");
          setNotifications(true);
        }
      } catch (error) {
        console.error("Error getting push token:", error);
      }
    } else {
      // Disable Notifications
      if (token) {
        try {
          const response: any = await notificationHandler(user.id, token, false);
          if (response) {
            await AsyncStorage.removeItem("expoPushToken");
            showSnackbar("The notification has been turned off successfully.");
            setNotifications(false);
          }
        } catch (error) {
          console.error("Error removing push token:", error);
        }
      }
    }
  };

  const logoutHandler = async () => {
    await logout();
    router.replace("/login");
  }

  return (
    <ScrollView style={[styles.container]}>
      <Text style={[styles.headerText, { color: textColor }]}>Settings</Text>

      <List.Item
        title={user.first_name + " " + user.last_name}
        description="View Profile"
        titleStyle={[styles.listItemTitle, { color: textColor }]}
        descriptionStyle={{ color: textColor }}
        left={() => <Avatar.Image size={55} source={{ uri: user.appUserImg }} />}
        right={() => <List.Icon icon="chevron-right" color={textColor} />}
        onPress={() => handleNavigation("view-profile", { userId: user.id })}
        style={[styles.listItem, { backgroundColor: cardColor }]}
      />

      <List.Item
        title="Default Theme Mode"
        titleStyle={[styles.listItemTitle, { color: textColor }]}
        left={() => <Entypo name="mobile" size={24} color="#fff" style={[styles.icon, { backgroundColor: "#6C757D" }]} />}
        right={() => <Switch value={isFollowSystem} color="#ef233d" onValueChange={toggleFollowSystem} />}
        style={styles.listItem}
      />

      <List.Item
        title="Dark Mode"
        titleStyle={[styles.listItemTitle, { color: textColor }]}
        left={() => <List.Icon icon="theme-light-dark" color="#fff" style={[styles.icon, { margin: "auto", backgroundColor: "#6C757D" }]} />}
        right={() => <Switch value={isDarkMode} color="#ef233d" onValueChange={toggleTheme} />}
        style={styles.listItem}
      />

      <List.Subheader style={[styles.sectionHeader, { color: textColor }]}>Profile</List.Subheader>
      <List.Item
        title="Edit Profile"
        titleStyle={[styles.listItemTitle, { color: textColor }]}
        left={() => <List.Icon icon="account-edit" color="#fff" style={[styles.icon, { backgroundColor: "#FF9800" }]} />}
        right={() => <List.Icon icon="chevron-right" color={textColor} />}
        onPress={() => handleNavigation("edit-profile")}
        style={styles.listItem}
      />

      <List.Item
        title="Change Password"
        titleStyle={[styles.listItemTitle, { color: textColor }]}
        left={() => <List.Icon icon="key" color="#fff" style={[styles.icon, { backgroundColor: "#2196F3" }]} />}
        right={() => <List.Icon icon="chevron-right" color={textColor} />}
        onPress={() => handleNavigation("change-password")}
        style={styles.listItem}
      />

      <List.Subheader style={[styles.sectionHeader, { color: textColor }]}>Notifications</List.Subheader>
      <List.Item
        title="Notifications"
        titleStyle={[styles.listItemTitle, { color: textColor }]}
        left={() => <List.Icon icon="bell" color="#fff" style={[styles.icon, { backgroundColor: "#4CAF50" }]} />}
        right={() => <Switch value={notifications} color="#ef233d" onValueChange={handlerNotification} />}
        style={styles.listItem}
      />

      <List.Subheader style={[styles.sectionHeader, { color: textColor }]}>Regional</List.Subheader>
      <List.Item
        title="Ramu Kaka"
        titleStyle={[styles.listItemTitle, { color: textColor }]}
        left={() => <List.Icon icon="face-man-shimmer" color="#fff" style={[styles.icon, { backgroundColor: "#9C27B0" }]} />}
        right={() => <List.Icon icon="chevron-right" color={textColor} />}
        onPress={() => handleNavigation("ramu-kaka")}
        style={styles.listItem}
      />

      <List.Item
        title="Logout"
        titleStyle={[styles.listItemTitle, { color: textColor }]}
        left={() => <List.Icon icon="logout" color="#fff" style={[styles.icon, { backgroundColor: "#F44336" }]} />}
        right={() => <List.Icon icon="chevron-right" color={textColor} />}
        onPress={() => logoutHandler()}
        style={styles.listItem}
      />

      <Text style={[styles.versionText, { color: textColor }]}>App version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerText: {
    fontSize: 28,
    fontFamily: "Poppins-SemiBold",
    marginTop: 15,
  },
  sectionHeader: {
    paddingLeft: 0,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  listItem: {
    paddingRight: 0,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 6,
  },
  listItemTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
  },
  icon: {
    height: 40,
    width: 40,
    borderRadius: 50,
    padding: 8,

  },
  versionText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 12,
    fontFamily: "Poppins-Bold",
  },
});

export default SettingsScreen;
