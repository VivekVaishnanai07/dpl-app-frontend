import useCountdownTimer from "@/hooks/useCountdownTimer";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

const CountdownTimer = React.memo(({ date }: any) => {
  const { days, hours, minutes, seconds } = useCountdownTimer(date);

  return (
    <View style={styles.timeBox}>
      <Text style={styles.timeText}>
        {days > 0 && <Text style={styles.timeText}>{days}d </Text>}
        <Text style={styles.timeText}>{hours}h </Text>
        <Text style={styles.timeText}>{minutes}m </Text>
        <Text style={styles.timeText}>{seconds}s</Text> left
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  timeBox: {
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
    flexDirection: "row",
    marginVertical: 8,
  },
  timeText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#E60012",
  },
})

export default CountdownTimer;