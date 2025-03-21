import Colors from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { getPointsPlayerBoard } from "@/services/playerBoardService";
import { decodeJWT } from "@/services/tokenService";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, Image, ImageBackground, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Tooltip } from "react-native-paper";

const { width, height } = Dimensions.get("window");

const LeaderboardScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [leaderboardList, setLeaderboardList] = useState<any>(null);
  const [topThreeData, setTopThreeData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const user = (await decodeJWT()) as any;
      if (user && user.tournamentId) {
        setUser(user);
        try {
          const response = await getPointsPlayerBoard(user.tournamentId, user.groupId);
          const topThree = response.filter((item: any) => [1, 2, 3].includes(item.current_rank)).sort((a: any, b: any) => a.current_rank - b.current_rank);
          const filteredArray = response.filter((item: any) => ![1, 2, 3].includes(item.current_rank));
          setLeaderboardList(filteredArray);
          setTopThreeData(topThree);
        } catch (error) {
          console.error("Error fetching profile details", error);
          navigation.navigate("view-profile");
        }
      }
    };
    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../assets/images/day2.jpg")}
        style={styles.topSection}
        resizeMode="cover"
      >
        <LinearGradient colors={["rgba(0,0,0,0.4)", "transparent"]} style={styles.gradient} />
        <View style={styles.header}>
          <FontAwesome name="mail-reply" size={24} color="white" style={styles.backArrow} onPress={() => navigation.goBack()} />
          <Text style={[styles.title, { color: "white" }]}>Leader Board</Text>
        </View>
        {topThreeData && (
          <View style={styles.podiumContainer}>
            <View style={{ alignItems: "center" }}>
              <Image source={{ uri: topThreeData[1].userImg }} style={styles.podiumAvatar} />
              <Tooltip title={`${topThreeData[1].total_points}`} >
                <View style={[styles.podium, styles.secondPlace]}>
                  <Text style={styles.podiumRank}>2</Text>
                </View>
              </Tooltip>
            </View>
            <View style={{ alignItems: "center" }}>
              <Image source={{ uri: topThreeData[0].userImg }} style={styles.podiumAvatar} />
              <View style={{ position: "absolute", top: -33 }}>
                <Image source={require("../assets/images/crown.png")} style={{ height: 40, width: 70 }} />
              </View>
              <Tooltip title={`${topThreeData[0].total_points}`} >
                <View style={[styles.podium, styles.firstPlace]}>
                  <Text style={styles.podiumRank}>1</Text>
                </View>
              </Tooltip>
            </View>
            <View style={{ alignItems: "center" }}>
              <Image source={{ uri: topThreeData[2].userImg }} style={styles.podiumAvatar} />
              <Tooltip title={`${topThreeData[2].total_points}`} >
                <View style={[styles.podium, styles.thirdPlace]}>
                  <Text style={styles.podiumRank}>3</Text>
                </View>
              </Tooltip>
            </View>
          </View>
        )}
      </ImageBackground>

      <View style={[styles.leaderboardContainer, { backgroundColor: Colors[theme].greyBackground }]}>
        <FlatList
          data={leaderboardList}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={({ item }: any) => (
            <View style={styles.listItemContainer}>
              <Text style={[styles.rank, { color: Colors[theme].text }]}>{item.current_rank}</Text>
              <View style={[styles.listItem, { backgroundColor: Colors[theme].cardBackground }, item.user_id === user.id && styles.highlightedItem]}>
                <View style={styles.userInfo}>
                  <Image source={{ uri: item.userImg }} style={styles.listAvatar} />
                  <View>
                    <Text style={[styles.name, { color: Colors[theme].text }]}>{item.full_name}</Text>
                    <Text style={[styles.points, { color: Colors[theme].text }]}>{item.total_points} pts</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", width: 55 }}>
                  <Text
                    style={[
                      styles.change,
                      item.rank_change === "down" ? { color: "red" } : item.rank_change === "up" && { color: "green" }
                    ]}
                  >
                    {item.rank_change === "up" ? `+${Math.abs(item.current_rank - item.previous_rank)}` : item.rank_change === "down" && `-${Math.abs(item.current_rank - item.previous_rank)}`}
                  </Text>
                  <View style={{ marginLeft: 4 }}>
                    {item.rank_change === "down" ? (
                      <AntDesign name="caretdown" size={18} color="red" style={{ marginBottom: 6 }} />
                    ) : item.rank_change === "up" && (
                      <AntDesign name="caretup" size={18} color="green" />
                    )}
                  </View>
                </View>

              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
      {topThreeData && topThreeData[0].user_id === user.id && (
        <LottieView
          source={require("../assets/celebration.json")}
          speed={0.6}
          autoPlay
          loop={false}
          style={{
            width: width,
            height: height,
            position: "absolute",
            top: 0,
            left: 0,
          }}
          resizeMode="cover"
        />
      )}
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topSection: {
    height: height * 0.4,
    width: "100%",
    justifyContent: 'center',
    alignItems: 'center'
  },
  gradient: {
    ...StyleSheet.absoluteFillObject
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    position: "fixed",
    top: -30
  },
  backArrow: {
    position: "sticky",
    left: -90,
    top: 0
  },
  title: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    marginVertical: 20,
    color: "#fff"
  },
  podiumContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: -35
  },
  podium: {
    alignItems: "center",
    justifyContent: "flex-start",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 10,
    marginHorizontal: width * 0.02
  },
  firstPlace: {
    backgroundColor: "#eb9191",
    height: height * 0.15,
    width: width * 0.2
  },
  secondPlace: {
    backgroundColor: "#b4be89",
    height: height * 0.12,
    width: width * 0.18
  },
  thirdPlace: {
    backgroundColor: "#e0be99",
    height: height * 0.10,
    width: width * 0.18
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: width * 0.09,
    marginBottom: 10
  },
  podiumRank: {
    color: "white",
    fontFamily: "Poppins-Bold",
    fontSize: 26
  },
  winnerBadge: {
    position: "absolute",
    bottom: 10
  },
  leaderboardContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -30,
    paddingTop: 20
  },
  listItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10
  },
  rank: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    width: 40,
    textAlign: "center"
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 12,
    marginVertical: 5,
    borderRadius: 15,
    width: "85%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3
  },
  highlightedItem: {
    borderColor: "#FFD700",
    borderWidth: 2
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center"
  },
  listAvatar: {
    width: width * 0.14,
    height: width * 0.14,
    borderRadius: width * 0.10,
    marginHorizontal: 10
  },
  name: {
    fontSize: 16,
    fontFamily: "Poppins-Medium"
  },
  points: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "gray"
  },
  change: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center"
  },
});

export default LeaderboardScreen;