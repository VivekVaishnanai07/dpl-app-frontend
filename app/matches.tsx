import Colors from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { getMatchesList } from "@/services/matcheService";
import { decodeJWT } from "@/services/tokenService";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { AnimatedFAB, Modal, Portal, SegmentedButtons, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const { height, width } = Dimensions.get("window");

const MatchesScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [value, setValue] = useState("all");
  const [matchData, setMatchData] = useState<any>(null);
  const [userRole, setUserRole] = useState("");
  const [visible, setVisible] = useState(false);
  const [matches, setMatches] = useState<{ id: string; team1: string; team2: string; status: string; date: string }[]>([]);

  // Dummy match data (Replace with API call)
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const user = (await decodeJWT()) as any;
        if (!user?.tournamentId) throw new Error("Invalid user data");

        setUserRole(user.role);
        const response = await getMatchesList(user.id, user.tournamentId);
        setMatches(response);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      }
    };
    fetchMatches();
  }, []);

  const checkWinnerTeam = (team: string | null) => team ? `${team} Won` : "Not Declared Yet";

  // Filter matches based on selection
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      if (value === "all") return true;
      const matchDate = new Date(match.date);
      return matchDate > new Date(); // Only future matches
    });
  }, [matches, value]);

  const showModal = (item: any) => {
    setVisible(true);
    setMatchData(item);
  };

  const hideModal = () => {
    setMatchData(null);
    setVisible(false);
  };

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
            <TouchableOpacity style={styles.cardContainer} onPress={() => showModal(item)}>
              <Text style={styles.matchNum}>{item.match_no}</Text>
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
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={[styles.emptyContainer, { backgroundColor: Colors[theme].secondaryBackground }]}>
              <Text style={styles.emptyText}>No matches found</Text>
            </View>
          }
        />
        {
          (userRole === "superAdmin" || userRole === "admin") && (
            <AnimatedFAB
              icon={'plus'}
              label={'Create Match'}
              extended={false}
              color="#fff"
              onPress={() => navigation.navigate("create-match")}
              visible={true}
              iconMode={'static'}
              style={[styles.fab, { backgroundColor: Colors[theme].tabBarIndicator }]}
            />
          )
        }
        {
          matchData && (
            <Portal>
              <Modal visible={visible} onDismiss={hideModal}>
                <View style={[styles.matchDetailsModal, { backgroundColor: Colors[theme].secondaryBackground }]}>
                  <Text style={styles.headerTitleText}>Match Details</Text>
                  <View style={styles.matchDetailsTopSection}>
                    <Image source={{ uri: matchData.team1_icon }} style={styles.matchDetailsIcon} resizeMode="contain" />
                    <Image source={theme === "light" ? require("../assets/images/vs5.png") : require("../assets/images/vs2.png")} style={styles.matchDetailsVsIcon} resizeMode="contain" />
                    <Image source={{ uri: matchData.team2_icon }} style={styles.matchDetailsIcon} resizeMode="contain" />
                  </View>
                  <Text style={{ fontFamily: "Poppins-Regular", fontSize: 16, alignSelf: "center", marginTop: 10 }}>{matchData.venue}</Text>
                  <Text style={{ fontFamily: "Poppins-Regular", fontSize: 16, alignSelf: "center", marginVertical: 10 }}>{dayjs(matchData.date).format('MMM D, YYYY h:mm A')}</Text>
                  <View style={styles.matchDetailsFooterSection}>
                    <Text style={[styles.statusText, theme === "light" ? (matchData.win_team ? styles.WonStatusColor : styles.notDeclaredStatusColor) : { color: "#fff" }]}>
                      Win Team:- {matchData.win_team ? matchData.win_team : "?"}
                    </Text>
                    <Text style={[styles.statusText, theme === "light" ? (matchData.win_team ? styles.WonStatusColor : styles.notDeclaredStatusColor) : { color: "#fff" }]}>
                      Predict Team:- {matchData.predict_team ? matchData.predict_team : "?"}
                    </Text>
                  </View>
                </View>
              </Modal>
            </Portal>
          )
        }
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
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  matchDetailsModal: {
    marginHorizontal: 20,
    borderRadius: 26,
    padding: 16
  },
  headerTitleText: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    alignSelf: "center",
  },
  matchDetailsIcon: {
    width: width * 0.19,
    height: height * 0.10,
  },
  matchDetailsVsIcon: {
    width: width * 0.13,
    height: height * 0.09,
  },
  matchDetailsTopSection: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  matchDetailsFooterSection: {
    borderTopWidth: 0.6,
    borderTopColor: "lightgrey",
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8
  }
});

export default MatchesScreen;