import Colors from "@/constants/Colors";
import { useNotifications } from "@/context/NotificationContext";
import { useTheme } from "@/context/ThemeContext";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Menu } from "react-native-paper";

const CustomHeader = ({ title }: { title: string }) => {
  const { theme } = useTheme();
  const { markAllAsRead, deleteAll } = useNotifications();
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={{ backgroundColor: Colors[theme].tabBarIndicator }}>
      <View style={styles.header}>
        {/* <AntDesign name="back" size={24} color="white" onPress={() => navigation.goBack()} /> */}
        <FontAwesome name="mail-reply" size={24} color="white" onPress={() => navigation.goBack()} />
        <Text style={{ fontSize: 22, fontFamily: "Poppins-SemiBold", color: "white" }}>{title}</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchorPosition="bottom"
          statusBarHeight={40}
          anchor={
            <TouchableOpacity disabled={title !== "Notification"} onPress={() => setMenuVisible(true)}>
              <Ionicons name="settings-outline" size={24} color={title === "Notification" ? "#ffffff" : Colors[theme].tabBarIndicator} />
            </TouchableOpacity>
          }
        >
          <Menu.Item onPress={markAllAsRead} title="Read All" style={{ height: 38 }} titleStyle={{ fontFamily: "Poppins-Medium", fontSize: 16 }} />
          <Menu.Item onPress={deleteAll} title="Delete All" style={{ height: 38 }} titleStyle={{ fontFamily: "Poppins-Medium", fontSize: 16 }} />
        </Menu>
      </View>
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginTop: 18,
  }
});