import Colors from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import MatchCard from "./MatchCard";

const MatchesData = ({ matches }: any) => {
  const { theme } = useTheme();
  return (
    <FlatList
      data={matches}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => <MatchCard match={item} />}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={[styles.emptyContainer, { backgroundColor: Colors[theme].secondaryBackground }]}>
          <Text style={styles.emptyText}>No matches found</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 10000
  },
  emptyContainer: {
    padding: 14,
    borderRadius: 16
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    alignSelf: "center"
  }
});

export default MatchesData;