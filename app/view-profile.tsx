import Colors from "@/constants/Colors";
import { useSnackbar } from "@/context/SnackbarContext";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { viewProfileUserDetails } from "@/services/userService";
import { Entypo, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { List } from "react-native-paper";

const { width, height } = Dimensions.get("window");

interface StatBoxProps {
  label: string;
  value: string | number;
  showBorder?: boolean;
  theme: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, showBorder, theme }) => (
  <View style={[styles.statBox, showBorder && styles.borderRight]}>
    <Text style={[styles.statValue, { color: Colors[theme].text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: Colors[theme].text }]}>{label}</Text>
  </View>
);

interface Last7Match {
  match_id: number;
  result: string; // "W" or "L"
  date: string;
}

const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useUser();
  const { showSnackbar } = useSnackbar();
  const [userDetails, setUserDetails] = useState<any>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const response = await viewProfileUserDetails(user.id);
          // If your API returns last_7_matches as a JSON string, uncomment the next line:
          // response.last_7_matches = JSON.parse(response.last_7_matches);
          setUserDetails(response);
        } catch (error) {
          console.error("Error fetching profile details", error);
        }
      }
    };
    fetchData();
  }, [user]);

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].greyBackground }]}>
      {/* Background with Gradient Overlay */}
      {
        userDetails && (
          <>
            <ImageBackground
              source={require("../assets/images/day.jpg")}
              style={styles.topSection}
            >
              <LinearGradient colors={["rgba(0,0,0,0.4)", "transparent"]} style={styles.gradient} />
              <View style={{ position: "absolute", top: 40, left: 30 }}>
                <FontAwesome name="mail-reply" size={24} color="white" onPress={() => navigation.goBack()} />
              </View>
              <View style={styles.profileContainer}>
                <AnimatedCircularProgress
                  size={width * 0.33}
                  width={6}
                  fill={Number(userDetails.level_completion_percentage)}
                  tintColor={Colors[theme].tabBarIndicator}
                  backgroundColor="#eee"
                  rotation={0}
                  lineCap="round"
                >
                  {() => (
                    <Image
                      source={{ uri: userDetails.userImg || "https://via.placeholder.com/100" }}
                      style={styles.avatar}
                    />
                  )}
                </AnimatedCircularProgress>
              </View>
            </ImageBackground>
            <View style={[styles.middleSection, { backgroundColor: Colors[theme].secondaryBackground }]}>
              <Text style={{ fontFamily: "Poppins-SemiBold", alignSelf: "center", fontSize: 18, paddingBottom: 8, color: Colors[theme].text }}>
                {userDetails.full_name}
              </Text>
              <View style={[styles.statsContainer, { marginBottom: 10, width: "90%", paddingVertical: 4, alignSelf: "center", backgroundColor: Colors[theme].cardBoxBackground }]}>
                <StatBox label="Level" value={userDetails.user_level} theme={theme} showBorder />
                <StatBox label="Points" value={userDetails.total_points} theme={theme} showBorder />
                <StatBox label="Streak" value={userDetails.best_streak} theme={theme} />
              </View>
              <View style={[styles.statsContainer, { backgroundColor: Colors[theme].cardBoxBackground }]}>
                <StatBox label="Matches" value={userDetails.total_matches} theme={theme} showBorder />
                <StatBox label="Win" value={userDetails.win_matches} theme={theme} showBorder />
                <StatBox label="Lose" value={userDetails.lose_matches} theme={theme} showBorder />
                <StatBox label="Accuracy" value={`${Math.floor(userDetails.accuracy)}%`} theme={theme} />
              </View>
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 16, fontFamily: "Poppins-Medium", paddingVertical: 10, color: Colors[theme].text }}>Last 7 Predictions</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                  {userDetails.last_7_matches && Array.isArray(userDetails.last_7_matches) ? (
                    userDetails.last_7_matches.map((match: any, index: any) => (
                      <View
                        key={index + 1}
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          borderColor: theme === "light" ? match.result === "W" ? "#2a841b" : "#d34646" : "#fff",
                          borderWidth: 1,
                          borderRadius: 20,
                          width: 40,
                          height: 40
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Poppins-SemiBold",
                            fontSize: 18,
                            color: theme === "light" ? match.result === "W" ? "#2a841b" : "#d34646" : "#fff",
                          }}
                        >
                          {match.result}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{ fontFamily: "Poppins-Medium", fontSize: 14 }}>No predictions available</Text>
                  )}
                </View>
              </View>
            </View>
            <ScrollView>
              {/* Menu Items */}
              <View style={styles.bottomSection}>
                <List.Item
                  title="Leaderboard"
                  titleStyle={{ fontSize: 15, fontFamily: "Poppins-Medium" }}
                  left={() => (
                    <MaterialIcons
                      name="leaderboard"
                      size={22}
                      color="#fff"
                      style={[styles.iconContainer, { backgroundColor: Colors[theme].tabBarIndicator }]}
                    />
                  )}
                  style={[styles.menuItem, styles.bottomBorder]}
                  onPress={() => navigation.navigate("leaderboard")}
                />
                <List.Item
                  title="Matches"
                  titleStyle={{ fontSize: 15, fontFamily: "Poppins-Medium" }}
                  left={() => (
                    <Entypo
                      name="list"
                      size={22}
                      color="#fff"
                      style={[styles.iconContainer, { backgroundColor: Colors[theme].tabBarIndicator }]}
                    />
                  )}
                  style={[styles.menuItem, styles.bottomBorder]}
                  onPress={() => navigation.navigate("matches")}
                />
                <List.Item
                  title="Head To Head"
                  titleStyle={{ fontSize: 15, fontFamily: "Poppins-Medium" }}
                  left={() => (
                    <MaterialIcons
                      name="compare"
                      size={22}
                      color="#fff"
                      style={[styles.iconContainer, { backgroundColor: Colors[theme].tabBarIndicator }]}
                    />
                  )}
                  style={styles.menuItem}
                  onPress={() => showSnackbar("This feature is coming soon.")}
                />
              </View>
            </ScrollView>
          </>
        )
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: {
    height: height * 0.4,
    justifyContent: "center",
    alignItems: "center",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  profileContainer: {
    alignItems: "center",
  },
  avatar: {
    width: width * 0.30,
    height: width * 0.30,
    borderRadius: width * 0.150,
    backgroundColor: "black",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  middleSection: {
    alignSelf: "center",
    backgroundColor: "#fff",
    marginTop: -50,
    borderRadius: 20,
    marginHorizontal: 10,
    padding: 20,
    elevation: 5,
    zIndex: 1000,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 6,
  },
  borderRight: {
    borderRightWidth: 0.5,
    borderRightColor: "#ccc",
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#555",
    textAlign: "center",
    flexWrap: "wrap",
    width: 90,
  },
  bottomSection: {
    marginTop: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  iconContainer: {
    alignItems: "center",
    padding: 11,
    justifyContent: "center",
    backgroundColor: "#218B84",
    borderRadius: 50,
    height: 45,
    width: 45,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default ProfileScreen;