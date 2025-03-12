import Colors from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { getMatchesList } from "@/services/matcheService";
import { decodeJWT } from "@/services/tokenService";
import { useEffect, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, View } from "react-native";
import { SegmentedButtons, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const MatchesScreen = () => {
  const { theme } = useTheme();
  const [value, setValue] = useState("all");
  const [matches, setMatches] = useState<{ id: string; team1: string; team2: string; status: string; date: string }[]>([]);

  // Team logos mapping (Fix dynamic require issue)
  const teamLogos: any = {
    CSK: require("../assets/images/CSK.png"),
    GT: require("../assets/images/GT.png"),
  };

  // Dummy match data (Replace with API call)
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const user = (await decodeJWT()) as any;
        if (user && user.tournamentId) {
          const response = await getMatchesList(user.tournamentId);
          setMatches(response);
        }
      } catch (error) {
        console.error("Error fetching profile details", error);
      }
    };

    fetchMatches();
  }, []);

  const checkWinnerTeam = (team: any) => {
    if (team) {
      return `${team} Won`
    } else {
      return `Not Declared Yet`
    }
  }

  // Filter matches based on selection
  const filteredMatches = matches.filter(match => {
    if (value === "all") return true;
    const matchDate = new Date(match.date);
    const currentDate = new Date();
    return matchDate.getTime() > currentDate.getTime(); // Only future matches
  });

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].tabBarIndicator }]}>
      <View style={[styles.innerContainer, { backgroundColor: Colors[theme].greyBackground }]}>
        <SafeAreaView style={styles.segmentSection}>
          <SegmentedButtons
            value={value}
            onValueChange={setValue}
            style={{ width: "70%" }}
            theme={{
              colors: {
                secondaryContainer: Colors[theme].tabBarIndicator,
                onSecondaryContainer: "#fff",
                primary: Colors[theme].tabBarIndicator,
                outline: Colors[theme].border,
                onSurface: Colors[theme].text,
              },
            }}
            buttons={[
              { value: "all", label: "All", labelStyle: styles.labelFont },
              { value: "upcoming", label: "Upcoming", labelStyle: styles.labelFont },
            ]}
          />
        </SafeAreaView>

        {/* Render Matches Dynamically */}
        <FlatList
          data={filteredMatches}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item, index }: any) => (
            <View style={styles.cardContainer}>
              <Text style={styles.matchNum}>{index + 1}</Text>
              <View style={[styles.listItem, { backgroundColor: Colors[theme].secondaryBackground }]}>
                <View style={styles.itemTopSection}>
                  <Image source={{ uri: item.team1_icon }} style={styles.teamImg} resizeMode="contain" />
                  <Image source={theme === "light" ? require("../assets/images/vs5.png") : require("../assets/images/vs2.png")} style={styles.vsImg} resizeMode="contain" />
                  <Image source={{ uri: item.team2_icon }} style={styles.teamImg} resizeMode="contain" />
                </View>
                <View style={styles.statusContainer}>
                  <Text style={[styles.statusText, theme === "light" ? (item.win_team ? styles.WonStatusColor : styles.notDeclaredStatusColor) : { color: "#fff" }]}>
                    {checkWinnerTeam(item.win_team)}
                  </Text>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={[styles.emptyContainer, { backgroundColor: Colors[theme].secondaryBackground }]}>
              <Text style={styles.emptyText}>No matches found</Text>
            </View>
          }
        />
      </View>
    </View >
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: {
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingBottom: 10,
  },
  segmentSection: {
    alignSelf: "center",
    marginTop: 10,
  },
  labelFont: {
    fontFamily: "Poppins-Regular",
    fontSize: 15,
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginTop: 14,
    flexWrap: "wrap",
  },
  matchNum: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    paddingRight: 4,
  },
  listItem: {
    padding: 12,
    marginVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 26,
    width: "80%",
    maxWidth: 400,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  itemTopSection: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.6,
    paddingHorizontal: 12,
    borderColor: "lightgrey",
    justifyContent: "space-between",
    paddingBottom: 8,
  },
  teamImg: {
    height: width * 0.12,
    width: width * 0.12,
  },
  vsImg: {
    height: width * 0.10,
    width: width * 0.18,
    marginTop: 8,
  },
  statusContainer: {
    alignSelf: "center",
    paddingTop: 10,
  },
  statusText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
  notDeclaredStatusColor: {
    color: "orange",
  },
  WonStatusColor: {
    color: "green",
  },
  emptyContainer: {
    padding: 14,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    alignSelf: "center"
  }
});

export default MatchesScreen;