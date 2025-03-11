import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import "react-native-gesture-handler";
import 'react-native-reanimated';

import CustomHeader from '@/components/CustomHeader';
import CustomSnackbar from '@/components/CustomSnackbar';
import LoadingScreen from '@/components/LoadingScreen';
import { NotificationProvider, useNotifications } from '@/context/NotificationContext';
import { SnackbarProvider } from '@/context/SnackbarContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { UserProvider } from '@/context/UserContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

SplashScreen.preventAutoHideAsync();

// Notification handler setup
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

if (!global.Buffer) {
  global.Buffer = require('buffer').Buffer;
}

async function registerForPushNotificationsAsync() {
  let token = null;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token!');
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) throw new Error('Project ID not found');

      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      await AsyncStorage.setItem('expoPushToken', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    alert('Must use a physical device for push notifications');
  }

  return token;
}

function RootLayoutInner() {
  const { theme } = useTheme();
  const { fetchNotifications } = useNotifications() || {};
  const [fontsLoaded] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-BlackItalic": require("../assets/fonts/Poppins-BlackItalic.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-BoldItalic": require("../assets/fonts/Poppins-BoldItalic.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraBoldItalic": require("../assets/fonts/Poppins-ExtraBoldItalic.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-ExtraLightItalic": require("../assets/fonts/Poppins-ExtraLightItalic.ttf"),
    "Poppins-Italic": require("../assets/fonts/Poppins-Italic.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-LightItalic": require("../assets/fonts/Poppins-LightItalic.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-MediumItalic": require("../assets/fonts/Poppins-MediumItalic.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-SemiBoldItalic": require("../assets/fonts/Poppins-SemiBoldItalic.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "Poppins-ThinItalic": require("../assets/fonts/Poppins-ThinItalic.ttf"),
  });

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      if (notification.date) {
        fetchNotifications();
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification clicked:', response);
      if (response.notification) {
        fetchNotifications();
      }
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider theme={theme === 'dark' ? MD3DarkTheme : MD3LightTheme}>
          <UserProvider>
            <SnackbarProvider>
              <Stack>
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="view-profile"
                  options={{ headerShown: false, animation: "fade" }}
                />
                <Stack.Screen
                  name="leaderboard"
                  options={{ headerShown: false, animation: "fade" }}
                />
                <Stack.Screen
                  name="matches"
                  options={{
                    header: () => <CustomHeader title="Matches" />,
                    animation: "fade",
                  }}
                />
                <Stack.Screen
                  name="head-to-head"
                  options={{
                    header: () => <CustomHeader title="Head To Head" />,
                    animation: "fade",
                  }}
                />
                <Stack.Screen
                  name="change-password"
                  options={{
                    header: () => <CustomHeader title="Change Password" />,
                    animation: "fade",
                  }}
                />
                <Stack.Screen
                  name="edit-profile"
                  options={{
                    header: () => <CustomHeader title="Edit Profile" />,
                    animation: "fade",
                  }}
                />
                <Stack.Screen
                  name="notification"
                  options={{
                    header: () => <CustomHeader title="Notification" />,
                    animation: "fade",
                  }} />
                <Stack.Screen
                  name="prediction"
                  options={{
                    header: () => <CustomHeader title="Prediction" />,
                    animation: "fade",
                  }} />
                <Stack.Screen
                  name="ramu-kaka"
                  options={{
                    header: () => <CustomHeader title="Ramu Kaka" />,
                    animation: "fade",
                  }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <LoadingScreen />
              <CustomSnackbar />
            </SnackbarProvider>
          </UserProvider>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </PaperProvider>
      </GestureHandlerRootView>
    </NavigationThemeProvider >
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <RootLayoutInner />
      </NotificationProvider>
    </ThemeProvider>
  );
}
