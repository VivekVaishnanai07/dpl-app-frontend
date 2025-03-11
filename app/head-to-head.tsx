import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Divider } from "react-native-paper";

const HeadToHeadComparison = () => {
  const user1: any = {
    name: "Vivek Vaishnani",
    level: 305,
    points: 201,
    matches: 6100,
    streak: 56,
    win: 210,
    lose: 305,
    accuracy: 7.54,
  };

  const user2: any = {
    name: "MS Dhoni",
    matches: 7100,
    level: 405,
    points: 101,
    streak: 16,
    win: 212,
    lose: 222,
    accuracy: 9.54,
  };

  const stats = [
    { label: "Level", key: "level" },
    { label: "Points", key: "points" },
    { label: "Matches", key: "matches" },
    { label: "Win", key: "win" },
    { label: "Lose", key: "lose" },
    { label: "Accuracy", key: "accuracy" },
    { label: "Streak", key: "streak" },
  ];

  const getProgress = (value1: number, value2: number) => {
    if (value1 === 0 && value2 === 0) return 0.5;
    return value1 / (value1 + value2);
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.playerName}>{user1.name}</Text>
        <Text style={styles.vs}>VS</Text>
        <Text style={styles.playerName}>{user2.name}</Text>
      </View>
      <Divider style={styles.divider} />

      {stats.map((stat, index) => {
        const value1 = user1[stat.key];
        const value2 = user2[stat.key];
        const progress = getProgress(value1, value2);
        const leftWidth: any = `${(1 - progress) * 50}%`;
        const rightWidth: any = `${progress * 50}%`;

        return (
          <View key={index} style={{ marginBottom: 14 }}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <View style={styles.statRow}>
              <Text style={styles.value}>{value1}</Text>

              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { left: "50%", width: leftWidth }]} />
                <View style={[styles.progressBar, { right: "50%", width: rightWidth }]} />
              </View>

              <Text style={styles.value}>{value2}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 15,
    padding: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  playerName: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    flex: 1,
    textAlign: "center",
  },
  vs: {
    fontSize: 16,
    color: "#333",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    minWidth: 60,
    textAlign: "center",
    flexShrink: 1,
  },
  progressContainer: {
    flex: 1,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 1,
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#007BFF",
  },
  divider: {
    marginVertical: 5,
    backgroundColor: "#ccc",
  },
  statLabel: {
    alignSelf: "center",
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    marginBottom: -8,
  },
});

export default HeadToHeadComparison;