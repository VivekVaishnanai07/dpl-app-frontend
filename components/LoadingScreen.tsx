import { GlobalLoaderConfig } from "@/api/loader-config";
import Colors from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

const LoadingScreen = () => {
  const { theme } = useTheme();
  const [loading] = GlobalLoaderConfig();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[theme].greyBackground }]}>
        <ActivityIndicator animating={true} size="large" color={Colors[theme].tabBarIndicator} />
        <Text style={[styles.text, { color: Colors[theme].text }]}>Loading...</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    marginTop: 10,
    fontSize: 18,
    fontFamily: "Poppins-Medium"
  },
});

export default LoadingScreen;
