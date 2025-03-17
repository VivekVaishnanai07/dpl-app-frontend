import Colors from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MatchesData from "./Matches";

const tabs = ["All", "Live", "Upcoming", "Finished"];

const SegmentButtons = ({ matches, setSearchText }: any) => {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState("Live");

  const filteredMatches = selectedTab === "All" ? matches : matches.filter((match: any) => match.match_status === selectedTab);
  return (
    <>
      <View style={[styles.container, { backgroundColor: Colors[theme].secondaryBackground }]}>
        <FlatList
          data={tabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ marginHorizontal: "auto" }}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tab} // Removed styles.activeTab
              onPress={() => {
                setSelectedTab(item);
                setSearchText("");
              }}
            >
              <Text style={[[styles.tabText, { color: Colors[theme].text }], selectedTab === item && [styles.activeTabText, { color: Colors[theme].tabBarIndicator }]]}>
                {item}
                {selectedTab === item && <View style={[styles.underline, { backgroundColor: Colors[theme].tabBarIndicator }]} />}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <MatchesData matches={filteredMatches} key={selectedTab} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    marginVertical: 20,
    marginHorizontal: 20,
    zIndex: 10
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#E60012",
    fontFamily: "Poppins-SemiBold"
  },
  underline: {
    width: "100%",
    height: 3,
    borderRadius: 2,
    marginTop: 2,
  },
});

export default SegmentButtons;
