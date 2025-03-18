import Colors from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { getPlayerBoard } from "@/services/playerBoardService";
import { decodeJWT } from "@/services/tokenService";
import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function PlayerTable() {
  const { theme } = useTheme();
  const [playerList, setPlayerList] = useState();

  useEffect(() => {
    const getPlayerBoardData = async () => {
      try {
        const user = await decodeJWT() as any;
        if (user && user.tournamentId && user.groupId) {
          const tournamentId = parseInt(user.tournamentId);
          const groupId = parseInt(user.groupId);
          const response = await getPlayerBoard(tournamentId, groupId);
          setPlayerList(response); // Return the response if needed
        } else {
          console.error("User data is missing required fields");
        }
      } catch (error) {
        console.error("Error fetching player board data:", error);
      }
    };

    getPlayerBoardData();
  }, [])

  const formatPercentage = (value: any) => {
    if (!value || isNaN(value)) return "0%";
    return `${Math.floor(Number(value))}%`;
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].secondaryBackground }]}>
      {/* Table Header */}
      <View style={[styles.header, { backgroundColor: Colors[theme].tableHeaderBackground }]}>
        <Text style={[styles.headerText, { width: "60%", textAlign: "left", color: Colors[theme].tableHeaderText }]}>Player</Text>
        <Text style={[styles.headerText, { color: Colors[theme].tableHeaderText }]}>W</Text>
        <Text style={[styles.headerText, { color: Colors[theme].tableHeaderText }]}>L</Text>
        <Text style={[styles.headerText, { color: Colors[theme].tableHeaderText }]}>PM</Text>
        <Text style={[styles.headerText, { color: Colors[theme].tableHeaderText }]}>WP</Text>
      </View>

      {/* Table Rows */}
      <FlatList
        data={playerList}
        keyExtractor={(item, index) => index.toString() + 1}
        renderItem={({ item, index }) => (
          <View style={styles.row} key={index + 1}>
            {/* Left cell with index, flag image, and team name */}
            <View style={[styles.cell, { width: "60%", flexDirection: "row", alignItems: "center" }]}>
              <Text style={{ paddingRight: 12, color: Colors[theme].text, fontFamily: "Poppins-Light" }}>{index + 1}.</Text>
              <Text style={{ fontFamily: "Poppins-SemiBold", paddingLeft: 12, color: Colors[theme].tableHeaderText }}>{item.full_name}</Text>
            </View>

            {/* Other cells */}
            <Text style={[styles.cell, { color: Colors[theme].tableHeaderText }]}>{item.win_matches}</Text>
            <Text style={[styles.cell, { color: Colors[theme].tableHeaderText }]}>{item.lose_matches}</Text>
            <Text style={[styles.cell, { color: Colors[theme].tableHeaderText }]}>{item.pay_money}</Text>
            <Text style={[styles.cell, { color: Colors[theme].tableHeaderText }]}>{formatPercentage(item.win_percentage)}</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false} // Show the scroll bar
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: height * 0.6,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: "auto",
    marginVertical: 6,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 20,
    paddingHorizontal: 12,
    width: "100%"
  },
  headerText: {
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
    width: "10%"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: "100%"
  },
  cell: {
    width: "10%",
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Poppins-Light",
  },
});
