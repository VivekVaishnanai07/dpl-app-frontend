import Colors from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, { useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";
import {
  FlatList,
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import { Text } from "react-native-paper";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

const SwipeCard = ({ item, onDelete, onMarkAsRead }: any) => {
  const { theme } = useTheme();
  const scrollRef = useRef(null);
  const translateX = useSharedValue(0);

  // Pan gesture handler
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx: any) => {
      translateX.value = ctx.startX + event.translationX;
    },
    onEnd: () => {
      if (translateX.value < -100) {
        runOnJS(onMarkAsRead)(item);
        translateX.value = withTiming(-150, { duration: 200 }, () => {
          translateX.value = withTiming(0, { duration: 200 });
        });
      } else if (translateX.value > 100) {
        runOnJS(onDelete)(item);
        translateX.value = withTiming(150, { duration: 200 }, () => {
          translateX.value = withTiming(0, { duration: 200 });
        });
      } else {
        translateX.value = withTiming(0, { duration: 200 });
      }
    },
  });

  // Animate card position
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Left background appears only when swiping right
  const leftBackgroundStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value > 0 ? translateX.value : 0,
      backgroundColor: "#FF8A80", // Color for right swipe (e.g., mark read)
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    };
  });

  // Right background appears only when swiping left
  const rightBackgroundStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value < 0 ? -translateX.value : 0,
      backgroundColor: "#B9F6CA", // Color for left swipe (e.g., delete)
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    };
  });

  // Animate icon opacity based on swipe distance
  const leftIconStyle = useAnimatedStyle(() => ({
    opacity:
      translateX.value > 0
        ? interpolate(translateX.value, [0, 150], [0, 1], Extrapolate.CLAMP)
        : 0,
  }));

  const rightIconStyle = useAnimatedStyle(() => ({
    opacity:
      translateX.value < 0
        ? interpolate(translateX.value, [-150, 0], [1, 0], Extrapolate.CLAMP)
        : 0,
  }));

  return (
    <View style={[styles.swipeContainer, { backgroundColor: Colors[theme].secondaryBackground }]}>
      {/* Left background for right swipe */}
      <Animated.View style={leftBackgroundStyle}>
        <Animated.View style={leftIconStyle}>
          <MaterialCommunityIcons name="delete-empty-outline" size={28} color="white" />
        </Animated.View>
      </Animated.View>
      {/* Right background for left swipe */}
      <Animated.View style={rightBackgroundStyle}>
        <Animated.View style={rightIconStyle}>
          <MaterialCommunityIcons name="check-bold" size={28} color="white" />
        </Animated.View>
      </Animated.View>
      <PanGestureHandler onGestureEvent={gestureHandler} activeOffsetX={[-10, 10]} simultaneousHandlers={scrollRef} >
        <Animated.View style={[cardStyle]}>
          <View style={styles.swipeCard}>
            <View style={[styles.avatarContainer, { backgroundColor: item.isRead === 0 ? "#FF3B30" : "#FF8A80" }]}>
              <MaterialCommunityIcons name="bell" size={22} color="white" style={{ padding: 8 }} />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={[styles.title, { color: Colors[theme].text }]} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                <Text style={[styles.date, { color: Colors[theme].text }]}>{dayjs(item.date).format("MMM DD, YYYY")}</Text>
              </View>
              <Text style={[styles.dec, { color: Colors[theme].text }]}>
                {item.dec}
              </Text>
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View >
  );
};

const CustomSwipeCard = ({ notifications, onDelete, onMarkAsRead }: any) => {
  const scrollRef = useRef(null);
  return (
    <GestureHandlerRootView>
      <SafeAreaView>
        <View style={{ marginTop: 8 }}>
          <FlatList
            ref={scrollRef}
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <SwipeCard item={item} onDelete={onDelete} onMarkAsRead={onMarkAsRead} />
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default CustomSwipeCard;


const styles = StyleSheet.create({
  swipeContainer: {
    position: "relative",
    overflow: "hidden",
    marginBottom: 10,
    borderRadius: 24,
    elevation: 1,
  },
  swipeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    width: "100%",
  },
  avatarContainer: {
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
  },
  cardContent: {
    flex: 1,
    paddingLeft: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  title: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    maxWidth: "60%",
  },
  date: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  dec: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    flexWrap: "wrap",
    width: "100%",
    lineHeight: 20,
  },
});
