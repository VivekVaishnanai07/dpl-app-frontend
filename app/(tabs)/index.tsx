import SegmentButtons from "@/components/SegmentButtons";
import Colors from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { getDashboardMatchesList } from "@/services/matcheService";
import { decodeJWT } from "@/services/tokenService";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Badge, IconButton } from "react-native-paper";


const Page = () => {
  const { theme } = useTheme();
  const { fetchUserData } = useUser();
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState("");
  const [matches, setMatches] = useState<any[]>([]);

  // Fetch matches from API whenever searchText changes
  const fetchMatches = async () => {
    try {
      const user = (await decodeJWT()) as any;
      if (user && user.tournamentId) {
        const tournamentId = parseInt(user.tournamentId);
        const response = await getDashboardMatchesList(tournamentId, searchText);
        setMatches(response);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchUserData();
  }, [searchText]); // When searchText changes, re-fetch

  // Called on search input changes
  const handleSearchText = (text: string) => {
    setSearchText(text);
  };

  return (
    <>
      <View style={styles.headerContainer}>
        {/* Red Box Background */}
        <View style={[styles.redBackground, { backgroundColor: Colors[theme].tabBarIndicator }]} />

        {/* Header Icons */}
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <AntDesign name="dingding" size={24} color={"#000"} />
          </View>
          <IconButton icon="bell-outline" size={24} iconColor="#fff" onPress={() => navigation.navigate("notification")} />
          <Badge visible={true} size={8} style={{ position: "absolute", top: 40, right: 25, backgroundColor: "#fff" }} />
        </View>

        {/* White Foreground Box */}
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <View style={[styles.liveUpdates, { backgroundColor: Colors[theme].secondaryBackground }]}>
            <Text style={[styles.title, { color: Colors[theme].text }]}>
              <Text style={{ color: Colors[theme].tabBarIndicator }}>LIVE Match Updates{"\n"}</Text>
              With Quick Score!
            </Text>

            {/* Search Bar & Filter Button */}
            <View style={[styles.searchSection, { backgroundColor: Colors[theme].greyBackground }]}>
              <TextInput
                value={searchText}
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#999"
                onChangeText={handleSearchText}
              />
              <TouchableOpacity>
                <IconButton icon="magnify" size={20} iconColor="#999" />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: Colors[theme].secondaryBackground }]} onPress={() => navigation.navigate("setting")}>
            <IconButton icon="tune-vertical" size={24} iconColor={Colors[theme].text} style={{ padding: 0, margin: 0 }} />
          </TouchableOpacity>
        </View>
      </View>
      <SegmentButtons matches={matches} setSearchText={setSearchText} />
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: "relative",
  },
  redBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "83%", // Covers the right half
    height: 220, // Adjust height as per design
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 26,
    paddingHorizontal: 6
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40
  },
  liveUpdates: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderTopRightRadius: 35,
    borderBottomRightRadius: 35,
    paddingHorizontal: 24,
    paddingVertical: 24,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    paddingBottom: 18
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  filterButton: {
    marginHorizontal: "auto",
    borderRadius: 12,
    marginBottom: 24,
    elevation: 4,
  },
});

export default Page;