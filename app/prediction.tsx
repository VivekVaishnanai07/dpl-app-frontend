import Colors from "@/constants/Colors";
import { useSnackbar } from "@/context/SnackbarContext";
import { useTheme } from "@/context/ThemeContext";
import { getMatchDetails } from "@/services/matcheService";
import { addPrediction, getPredictedUserList, getUserPrediction, updatePrediction } from "@/services/predictionService";
import { decodeJWT } from "@/services/tokenService";
import { FontAwesome6 } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolate,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

function VerticalPlayerNameSlider({
  predictedUsers,
  color,
  side
}: {
  color: string;
  side: "left" | "right";
  predictedUsers: any
}) {
  const width = useSharedValue(120);

  useEffect(() => {
    width.value = withSpring(120, {
      damping: 15,
      stiffness: 150,
      mass: 0.5,
      overshootClamping: true,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: color,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    alignItems: "center",
    borderColor: "#fff",
    borderWidth: 3,
    ...(side === "left"
      ? {
        borderLeftWidth: 0,
        borderTopRightRadius: 40,
        borderBottomRightRadius: 40,
        left: 0,
      }
      : {
        borderRightWidth: 0,
        borderTopLeftRadius: 40,
        borderBottomLeftRadius: 40,
        right: 0,
      }),
    height: 48,
    minWidth: 80,
    flexShrink: 0,
    position: "absolute",
    zIndex: 10,
  }));
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.sliderContainer, { alignItems: side === 'left' ? "flex-start" : "flex-end" }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {predictedUsers.map((item: any, index: number) => (
          <View key={index} style={styles.labelRow}>
            <Animated.View style={animatedStyle}>
              <Text style={styles.activePlayerName} numberOfLines={1}>
                {item.first_name}
              </Text>
            </Animated.View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView >
  );
}

function PredictionScreen() {
  const { theme } = useTheme();
  const route = useRoute<any>();
  const { showSnackbar } = useSnackbar();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const translateY = useSharedValue(0);
  const rippleScale = useSharedValue(1);
  const hintTranslateY = useSharedValue(0);

  // States for data
  const [matchData, setMatchData] = useState<any>({});
  const [userData, setUserData] = useState<any>({});
  const [predictionId, setPredictionId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [defaultTeamId, setDefaultTeamId] = useState<number | null>(null);
  const [homeTeamUsers, setHomeTeamUsers] = useState<any[]>([]);
  const [awayTeamUsers, setAwayTeamUsers] = useState<any[]>([]);
  const [homeTeamCount, setHomeTeamCount] = useState(0);
  const [awayTeamCount, setAwayTeamCount] = useState(0);
  const [winTeam, setWinTeam] = useState<any>(null);
  const [matchEnded, setMatchEnded] = useState(false);
  // Store decoded user & tournament data
  const [tournamentData, setTournamentData] = useState<{ groupId?: string; tournamentId?: string }>({});

  useEffect(() => {
    (async () => {
      try {
        const user = await decodeJWT() as any;
        if (user) {
          setUserId(parseInt(user.id));
          setUserData(user);
          setTournamentData({ groupId: user.groupId, tournamentId: user.tournamentId });
        }
      } catch (error) {
        console.error("Error decoding JWT:", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (id) {
      fetchMatchData();
    }
    if (userId && id) {
      getPredictionData(userId, id);
    }
  }, [id, userId]);

  useEffect(() => {
    if (id && tournamentData && Object.keys(tournamentData).length > 0) {
      const fetchData = async () => {
        try {
          const response = await getPredictedUserList(id, tournamentData);
          if (response) {
            const team1Users = response.filter((item: any) => item.predicted_team_id === matchData.team_1_id);
            const team2Users = response.filter((item: any) => item.predicted_team_id === matchData.team_2_id);
            setHomeTeamUsers(team1Users);
            setAwayTeamUsers(team2Users);
            setHomeTeamCount(team1Users.length);
            setAwayTeamCount(team2Users.length);
          }
        } catch (error) {
          console.error("Error fetching predicted users:", error);
        }
      };
      fetchData();
    }
  }, [id, tournamentData, matchData]);

  useEffect(() => {
    const animation = withRepeat(
      withSequence(
        withTiming(1.3, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1.1, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );

    rippleScale.value = animation;

    return () => {
      cancelAnimation(rippleScale);
    };
  }, []);

  useEffect(() => {
    const hintAnimation = withRepeat(
      withSequence(
        withTiming(15, {
          duration: 800,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: 800,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      3,
      false
    );

    const interval = setInterval(() => {
      hintTranslateY.value = hintAnimation;
    }, 5000);

    return () => {
      clearInterval(interval);
      cancelAnimation(hintTranslateY);
    };
  }, []);

  useEffect(() => {
    if (matchData && selectedTeam !== null && matchEnded) {
      if (matchData.winner_team !== null) {
        setWinTeam(matchData.winner_team === selectedTeam);
      } else {
        setWinTeam(null);
      }
    }
  }, [matchData, selectedTeam, matchEnded]);

  const fetchMatchData = async () => {
    try {
      const response = await getMatchDetails(id);
      if (response) {
        setMatchData(response);
        const matchTime = dayjs(response.date);
        const now = dayjs();

        if (now.isAfter(matchTime)) {
          setMatchEnded(true);
        }
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  const getPredictionData = async (userId: number, matchId: number) => {
    try {
      // Use stored tournamentData if available
      const response = await getUserPrediction(userId, matchId, tournamentData);
      if (response) {
        setPredictionId(response.id);
        setSelectedTeam(response.team_id);
        setDefaultTeamId(response.team_id);
      }
    } catch (error) {
      console.error("Error fetching prediction data:", error);
    }
  };

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: interpolate(
      rippleScale.value,
      [1.1, 1.3],
      [0.4, 0.1],
      Extrapolate.CLAMP
    ),
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const hintAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: hintTranslateY.value }],
    opacity: interpolate(
      hintTranslateY.value,
      [0, 15],
      [0.8, 0.2]
    ),
  }));

  const bottomAlign = homeTeamCount > 7 || awayTeamCount > 7;

  const selectedTeamHandler = (team: number | null) => {
    // Update selected team state
    setSelectedTeam(team);

    // User object for prediction
    const user = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      predicted_team_id: team
    };

    // Create deep copies of team arrays to avoid state mutation
    let updatedHome = [...homeTeamUsers];
    let updatedAway = [...awayTeamUsers];

    // Check if user already exists in either team
    const isUserInHome = updatedHome.some(
      (u) => u.first_name === userData.firstName && u.last_name === userData.lastName
    );
    const isUserInAway = updatedAway.some(
      (u) => u.first_name === userData.firstName && u.last_name === userData.lastName
    );

    if (team === null) {
      // If `null`, remove the user from both teams
      updatedHome = updatedHome.filter(
        (u) => u.first_name !== userData.firstName || u.last_name !== userData.lastName
      );
      updatedAway = updatedAway.filter(
        (u) => u.first_name !== userData.firstName || u.last_name !== userData.lastName
      );
    } else if (isUserInHome && team === matchData.team_2_id) {
      // Move from home to away
      updatedHome = updatedHome.filter(
        (u) => u.first_name !== userData.firstName || u.last_name !== userData.lastName
      );
      updatedAway.push(user);
    } else if (isUserInAway && team === matchData.team_1_id) {
      // Move from away to home
      updatedAway = updatedAway.filter(
        (u) => u.first_name !== userData.firstName || u.last_name !== userData.lastName
      );
      updatedHome.push(user);
    } else if (!isUserInHome && !isUserInAway) {
      // If user is not in any team, add them to the selected team
      if (team === matchData.team_1_id) {
        updatedHome.push(user);
      } else if (team === matchData.team_2_id) {
        updatedAway.push(user);
      }
    }

    // Update state with modified arrays
    setHomeTeamUsers(updatedHome);
    setAwayTeamUsers(updatedAway);
    setHomeTeamCount(updatedHome.length);
    setAwayTeamCount(updatedAway.length);
  };

  const onSave = async () => {
    try {
      let predictionData = {
        matchId: id,
        userId: userId,
        teamId: selectedTeam,
        tournamentId: tournamentData.tournamentId,
        groupId: tournamentData.groupId
      };
      let teamName = "";
      if (selectedTeam === matchData.team_1_id) {
        teamName = matchData.team_1
      } else {
        teamName = matchData.team_2
      }
      if (defaultTeamId !== null) {
        let prediction = {
          matchId: id,
          userId: userId,
          predictionId: predictionId,
          teamId: selectedTeam,
          tournamentId: tournamentData.tournamentId,
          groupId: tournamentData.groupId
        }
        const response = await updatePrediction(prediction);
        if (response !== undefined) {
          showSnackbar(`You have selected ${teamName} and the result will be declared after the match is complete.`);
          navigation.navigate('(tabs)');
        }
      } else {
        const response = await addPrediction(predictionData);
        if (response !== undefined) {
          showSnackbar(`You have selected ${teamName}. The final result will be announced after the match is complete.`);
          navigation.navigate('(tabs)');
        }
      }
      // Further processing here...
    } catch (error) {
      console.error("Error in onSave:", error);
    }
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startY: number }>({
    onStart: (_, context) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      const newValue = context.startY + event.translationY;
      translateY.value = Math.min(100, Math.max(newValue, -20));
    },
    onEnd: (event) => {
      if (event.translationY > 50) {
        translateY.value = withTiming(80, {
          duration: 300,
          easing: Easing.linear
        }, (finished) => {
          if (finished) {
            translateY.value = withTiming(0, {
              duration: 500,
              easing: Easing.linear
            }, (finished) => {
              if (finished) {
                runOnJS(onSave)();
              }
            });
          }
        });
      } else {
        translateY.value = withTiming(0, {
          duration: 300,
          easing: Easing.linear
        });
      }
    },
  });

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors[theme].tabBarIndicator }}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[theme].greyBackground }]}>
        <View style={styles.container}>
          <Text style={[styles.matchNumberText, { color: Colors[theme].text }]}>{matchData.match_no} of 74 Matches</Text>

          <View style={[styles.cardContainer, { backgroundColor: Colors[theme].secondaryBackground }]}>
            <View style={styles.headerContainer}>
              <Text style={[styles.dateText, { color: Colors[theme].text }]}>{dayjs(matchData.date).format('dddd, MMMM D')}</Text>
              <Text style={[styles.timeText, { color: Colors[theme].text }]}>{dayjs(matchData.date).format('hh:mm A')}</Text>
            </View>
            <View style={styles.matchRow}>
              {/* Left (Home) Team */}
              <TouchableOpacity style={styles.teamContainer} onPress={() => !matchEnded && selectedTeamHandler(matchData.team_1_id)}>
                <Text style={[styles.leftTeamNumber, {
                  left: String(3).length > 1 ? 25 : 35,
                  fontSize: String(3).length > 2 ? 40 : 50,
                  color: matchData.team1_color
                }]}>{homeTeamCount}</Text>
                <Image
                  source={{ uri: matchData.team1_jersey }}
                  style={[styles.teamImage, styles.leftTeamImage, { opacity: matchData.team_1_id === selectedTeam ? 0.2 : 1 }]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              {/* Left (Home) Team */}
              <View style={[styles.radioContainer, { top: 50, zIndex: 10 }]}>
                <View style={[styles.outerCircle, { backgroundColor: theme === 'light' ? "#cec6c6d4" : "lightgrey" }]}>
                  {matchData.team_1_id === selectedTeam && <View style={[styles.innerCircle, { backgroundColor: matchData.team1_color }]} />}
                </View>
              </View>

              <View style={[styles.divider, { minHeight: 180 }]} />
              {/* Right (Away) Team */}
              <View style={styles.radioContainer}>
                <View style={[styles.outerCircle, { backgroundColor: theme === 'light' ? "#cec6c6d4" : "lightgrey" }]}>
                  {matchData.team_2_id === selectedTeam && <View style={[styles.innerCircle, { backgroundColor: matchData.team2_color }]} />}
                </View>
              </View>

              {/* Right (Away) Team */}
              <TouchableOpacity style={styles.teamContainer} onPress={() => !matchEnded && selectedTeamHandler(matchData.team_2_id)}>
                <Text style={[styles.rightTeamNumber, {
                  right: String(3).length > 1 ? 25 : 35,
                  fontSize: String(3).length > 2 ? 40 : 50,
                  color: matchData.team2_color
                }]}>{awayTeamCount}</Text>
                <Image
                  source={{ uri: matchData.team2_jersey }}
                  style={[styles.teamImage, styles.rightTeamImage, { opacity: matchData.team_2_id === selectedTeam ? 0.2 : 1 }]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* Fixed Team Info at the bottom of the card */}
            <View style={[styles.fixedInfoContainer,]}>
              <View style={[styles.teamInfoLeftFixed, { backgroundColor: Colors[theme].secondaryBackground }]}>
                <Text style={[styles.teamName, { color: Colors[theme].text }]}>{matchData.team_1}</Text>
              </View>
              <View style={styles.divider} />
              <View style={[styles.teamInfoRightFixed, { backgroundColor: Colors[theme].secondaryBackground }]}>
                <Text style={[styles.teamName, { color: Colors[theme].text }]}>{matchData.team_2}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.mainRow, { alignItems: bottomAlign ? undefined : "center" }]}>
            <View style={styles.sliderWrapper}>
              {matchData.team1_color && (
                <VerticalPlayerNameSlider
                  predictedUsers={homeTeamUsers}
                  color={matchData.team1_color}
                  side="left"
                />
              )}
            </View>

            {!matchEnded ? (<View style={styles.centerContent}>
              <Text style={[styles.swipeHintText, { color: Colors[theme].text }]}>
                Swipe down to save
              </Text>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <PanGestureHandler onGestureEvent={gestureHandler}>
                  <Animated.View style={[styles.swipeIndicator, animatedStyle]}>
                    <Animated.View style={[styles.rippleEffect, rippleStyle, { backgroundColor: theme === "light" ? 'rgba(87, 81, 81, 0.7)' : "#fff", }]} />
                    <View style={styles.pill}>
                      <View style={styles.textContainer}>
                        <Text style={styles.swipeText}>Swipe</Text>
                        <Text style={styles.swipeTextBold}>to {defaultTeamId ? 'update' : 'save'}</Text>
                        <Animated.View style={[styles.arrowContainer, hintAnimatedStyle]}>
                          <FontAwesome6
                            name="chevron-down"
                            size={16}
                            color="#666"
                            style={styles.arrowIcon}
                          />
                        </Animated.View>
                      </View>
                    </View>
                  </Animated.View>
                </PanGestureHandler>
              </GestureHandlerRootView>
            </View>) : (
              <View style={styles.centerContent}>
                {winTeam === null && (
                  <Image source={{ uri: "https://res.cloudinary.com/dai95ygut/image/upload/v1741091569/other_image/vwc7hqqyvrocahwos0is.png" }} style={styles.afterMatchImg} resizeMode="contain" />
                )}
                {winTeam !== null && (winTeam ? (
                  <Image source={{ uri: "https://res.cloudinary.com/dai95ygut/image/upload/v1741091405/other_image/er9mkcsfow0ab5pcb7nj.png" }} style={styles.afterMatchImg} resizeMode="contain" />
                ) : (
                  <Image source={{ uri: "https://res.cloudinary.com/dai95ygut/image/upload/v1741091405/other_image/nzfn9egv4jjqmkt2nic3.png" }} style={styles.afterMatchImg} resizeMode="contain" />
                ))}
              </View>
            )}

            <View style={styles.sliderWrapper}>
              {matchData.team2_color && (
                <VerticalPlayerNameSlider
                  predictedUsers={awayTeamUsers}
                  color={matchData.team2_color}
                  side="right"
                />
              )}
            </View>

          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  matchNumberText: {
    fontSize: 16,
    color: '#666',
    fontFamily: "Poppins-Medium",
    marginBottom: 20,
  },
  cardContainer: {
    backgroundColor: "#FFF",
    width: "90%",
    borderRadius: 12,
    height: 310,
    elevation: 8,
    overflow: "hidden",
    position: "relative",
  },
  headerContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
  },
  dateText: {
    color: "#000",
    fontFamily: "Poppins-Medium",
    fontSize: 16,
  },
  timeText: {
    color: "#000",
    fontFamily: "Poppins-Medium",
    fontSize: 16,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    position: "relative",
    height: 170,
  },
  teamContainer: {
    alignItems: "center",
    width: "50%",
  },
  teamImage: {
    height: 270,
    width: 242,
  },
  leftTeamImage: {
    position: "absolute",
    top: -94,
    left: -70,
  },
  rightTeamImage: {
    position: "absolute",
    top: -94,
    right: -70,
    transform: [{ scaleX: -1 }],
  },
  divider: {
    borderLeftWidth: 1,
    borderLeftColor: "#e3e3e3",
    borderStyle: "dashed",
    alignSelf: "stretch",
  },
  radioContainer: {
    position: "absolute",
    left: "48%",
    alignItems: "center",
    justifyContent: "center",
  },
  outerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 6,
  },
  fixedInfoContainer: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "lightgrey",
    elevation: 6,
  },
  teamInfoLeftFixed: {
    width: "50%",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    borderBottomLeftRadius: 12,
  },
  teamInfoRightFixed: {
    width: "50%",
    justifyContent: "center",
    borderTopWidth: 0,
    alignItems: "center",
    padding: 8,
    borderBottomRightRadius: 12,
  },
  teamName: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    paddingTop: 20,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 40,
  },
  swipeHintText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  pill: {
    width: 90,
    height: 90,
    backgroundColor: '#fff',
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
    overflow: 'hidden',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  swipeText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  swipeTextBold: {
    color: '#444',
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.5,
    marginTop: -2,
    marginBottom: 8,
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  arrowIcon: {
    color: '#666',
  },
  rippleEffect: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 70,
    zIndex: 2,
    top: 0,
    left: 0,
  },
  sliderWrapper: {
    height: height * 0.43,
    justifyContent: "center",
    width: width * 0.25,
    paddingHorizontal: 0,
  },
  sliderContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 20,
    maxWidth: 120
  },
  labelRow: {
    height: 48,
    minWidth: 60,
    maxWidth: 80,
    marginBottom: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  activePlayerName: {
    fontSize: 14,
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.3,
  },
  activeScoreLabel: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    // letterSpacing: 0.5,
  },
  inactiveScoreLabel: {
    fontSize: 15,
    color: "#666",
    fontFamily: 'Poppins-Medium',
    padding: 4,
    textAlign: "center",
  },
  swipeIndicator: {
    alignSelf: 'center',
    zIndex: 1,
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    width: "100%",
  },
  leftTeamNumber: {
    position: 'absolute',
    top: -50,
    left: 35,
    fontSize: 50,
    fontFamily: 'Poppins-Bold',
    zIndex: 10,
  },
  rightTeamNumber: {
    position: 'absolute',
    top: -50,
    right: 35,
    fontSize: 50,
    fontFamily: 'Poppins-Bold',
    zIndex: 10,
  },
  afterMatchImg: {
    width: 180,
    height: 180
  }
});

export default PredictionScreen;