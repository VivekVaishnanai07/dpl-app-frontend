import { getPointsPlayerBoard } from "@/services/playerBoardService";
import { decodeJWT } from "@/services/tokenService";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, Image, ImageBackground, SafeAreaView, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");

const leaderboardData = [
  { id: "1", name: "Jennifer", points: 780, rank: "04", change: "+3", avatar: "https://avatar.iran.liara.run/public/1" },
  { id: "2", name: "William", points: 756, rank: "05", change: "-1", avatar: "https://avatar.iran.liara.run/public/2" },
  { id: "3", name: "Samantha", points: 698, rank: "06", change: "-2", avatar: "https://avatar.iran.liara.run/public/3", highlighted: true },
  { id: "4", name: "Emery", points: 636, rank: "07", change: "-1", avatar: "https://avatar.iran.liara.run/public/4" },
  { id: "5", name: "Lydia", points: 560, rank: "08", change: "-1", avatar: "https://avatar.iran.liara.run/public/5" },
  { id: "6", name: "Lydia", points: 560, rank: "09", change: "-1", avatar: "https://avatar.iran.liara.run/public/5" },
  { id: "7", name: "Lydia", points: 560, rank: "10", change: "-1", avatar: "https://avatar.iran.liara.run/public/5" },
];

type Player = {
  id: string;
  avatar: string;
  current_rank: number;
  full_name: string;
  total_points: number;
  rank_change: string;
  previous_rank: number;
  userImg: string;
  highlighted?: boolean;
};

const LeaderboardScreen = () => {
  const navigation = useNavigation();
  const [leaderboardList, setLeaderboardList] = useState<Player[] | null>(null);
  const [topThreeData, setTopThreeData] = useState<Player[] | null>(null);
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
              <View style={[styles.podium, styles.secondPlace]}>
                <Text style={styles.podiumRank}>2</Text>
              </View>
            </View>
            <View style={{ alignItems: "center" }}>
              <Image source={{ uri: topThreeData[0].userImg }} style={styles.podiumAvatar} />
              <View style={{ position: "absolute", top: -33 }}>
                <Image source={require("../assets/images/crown.png")} style={{ height: 40, width: 70 }} />
              </View>
              <View style={[styles.podium, styles.firstPlace]}>
                <Text style={styles.podiumRank}>1</Text>
              </View>
            </View>
            <View style={{ alignItems: "center" }}>
              <Image source={{ uri: topThreeData[2].userImg }} style={styles.podiumAvatar} />
              <View style={[styles.podium, styles.thirdPlace]}>
                <Text style={styles.podiumRank}>3</Text>
              </View>
            </View>
          </View>
        )}
      </ImageBackground>

      <View style={styles.leaderboardContainer}>
        <FlatList
          data={leaderboardList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: any) => (
            <View style={styles.listItemContainer}>
              <Text style={styles.rank}>{item.current_rank}</Text>
              <View style={[styles.listItem, item.user_id === user.id && styles.highlightedItem]}>
                <View style={styles.userInfo}>
                  <Image source={{ uri: item.userImg }} style={styles.listAvatar} />
                  <View>
                    <Text style={styles.name}>{item.full_name}</Text>
                    <Text style={styles.points}>{item.total_points} pts</Text>
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
    </SafeAreaView>
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
    borderRadius: width * 0.06,
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