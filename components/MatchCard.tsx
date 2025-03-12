import Colors from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Menu, Text } from "react-native-paper";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import CountdownTimer from "./CountdownTimer";

const MatchCard = ({ match }: any) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [visible, setVisible] = useState(false);
  const [isMatchFinished, setIsMatchFinished] = useState(dayjs(match.date).isBefore(dayjs()));

  useEffect(() => {
    setIsMatchFinished(dayjs(match.date).isBefore(dayjs()));
  }, [match.date]);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleCountdownComplete = () => {
    console.log("Countdown finished!");
    setIsMatchFinished(true);
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(500)}
      exiting={FadeOutDown.duration(300)}
      style={[styles.card, { backgroundColor: Colors[theme].secondaryBackground }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: Colors[theme].text }]}>{match.match_status} Match</Text>
        {(match.match_status !== "Finished" && !isMatchFinished) && (
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            contentStyle={styles.menuContent}
            anchor={
              <Entypo
                name="dots-three-horizontal"
                size={22}
                color={theme === 'dark' ? Colors[theme].text : "grey"}
                onPress={openMenu}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                navigation.navigate("prediction", { id: match.id });
                closeMenu();
              }}
              title="Prediction"
              titleStyle={{ color: "#000" }}
            />
          </Menu>
        )}
      </View>

      {/* Teams */}
      <View style={styles.teams}>
        <View style={styles.team}>
          <Image source={{ uri: match.team1_icon }} style={styles.teamLogo} />
          <Text style={[styles.teamName, { color: Colors[theme].text }]}>{match.team1}</Text>
        </View>

        <View style={styles.vsIcon}>
          <Image style={styles.matchIcon} source={theme === 'dark' ? require("../assets/images/vs3.png") : require("../assets/images/vs4.png")} />
        </View>

        <View style={styles.team}>
          <Image source={{ uri: match.team2_icon }} style={styles.teamLogo} />
          <Text style={[styles.teamName, { color: Colors[theme].text }]}>{match.team2}</Text>
        </View>
      </View>

      {/* Timer or View All */}
      {isMatchFinished ? (
        <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate("prediction", { id: match.id })}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      ) : (
        <CountdownTimer date={match.date} onComplete={handleCountdownComplete} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 40,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 8
  },
  headerText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  menuContent: {
    backgroundColor: "#f2f2f2",
    width: 120,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 100,
  },
  teams: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
    marginHorizontal: 16,
  },
  team: {
    alignItems: "center",
  },
  teamLogo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    shadowColor: "#fff",
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 9,
    elevation: 4,
  },
  teamName: {
    marginTop: 5,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#555",
  },
  vsIcon: {
    paddingHorizontal: 10,
  },
  matchIcon: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
  viewAllButton: {
    backgroundColor: "#E60012",
    borderRadius: 8,
    alignSelf: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginTop: 10,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
  },
});

export default MatchCard;