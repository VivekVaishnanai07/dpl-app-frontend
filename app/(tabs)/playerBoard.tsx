import PlayerTable from '@/components/PlayerTable';
import Colors from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LiveMatchScreen() {
  const { theme } = useTheme();

  // Memoize theme-based styles
  const themeStyles = useMemo(() => ({
    cardBackground: Colors[theme].tabBarIndicator,
    tableBackground: theme === 'dark' ? "#0a0d10" : "#f2f2f2",
    footerBackground: theme === 'dark' ? "#bcbcd2" : "#2b2c43",
    icon: Colors[theme].icon,
    tabBarIndicator: Colors[theme].tabBarIndicator,
    background: Colors[theme].background,
  }), [theme]);

  return (
    <>
      <LinearGradient colors={[themeStyles.cardBackground, '#D80032']} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.iconWrapper}>
            <AntDesign name="dingding" size={24} color={themeStyles.icon} />
          </View>
          <Text style={[styles.liveIndicator, { color: themeStyles.tabBarIndicator, backgroundColor: themeStyles.icon }]}>
            ● LIVE
          </Text>
        </View>

        <View style={styles.scoreRow}>
          <TeamCard logo={require("../../assets/images/GT.png")} name="Gujarat Titans" textColor={themeStyles.icon} />
          <Image source={require("../../assets/images/vs2.png")} style={styles.vsText} />
          <TeamCard logo={require("../../assets/images/CSK.png")} name="Chennai Super Kings" textColor={themeStyles.icon} />
        </View>

        <TouchableOpacity style={[styles.liveStatsButton, { backgroundColor: themeStyles.icon }]}>
          <Text style={[styles.liveStatsText, { color: themeStyles.tabBarIndicator }]}>Live Statistics</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.tableSection}>
        <LinearGradient colors={[themeStyles.tableBackground, themeStyles.footerBackground]} style={styles.tableContainer}>
          <PlayerTable />
        </LinearGradient>
        <View style={[styles.footer, { backgroundColor: themeStyles.footerBackground }]}>
          <Text style={[styles.footerText, { color: themeStyles.background }]}>
            LIVE from England. {"\n"}Australia has won the toss and elected to bat.
          </Text>
        </View>
      </View>
    </>
  );
}

// Extracted TeamCard Component to Reduce Code Duplication
const TeamCard = ({ logo, name, textColor }: any) => (
  <View style={styles.team}>
    <View style={[styles.teamLogoWrapper, { backgroundColor: textColor }]}>
      <Image source={logo} style={styles.flag} />
    </View>
    <Text style={[styles.teamName, { color: textColor }]}>{name}</Text>
  </View>
);

// Styles
const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 26,
    paddingHorizontal: 6,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
  },
  liveIndicator: {
    alignSelf: "flex-end",
    fontFamily: "Poppins-Bold",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  team: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  teamLogoWrapper: {
    borderRadius: 27,
    elevation: 6,
    padding: 6,
  },
  flag: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  teamName: {
    width: 100,
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Poppins-Medium",
    marginTop: 8,
  },
  vsText: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  tableSection: {
    position: "absolute",
    bottom: 0,
  },
  tableContainer: {
    borderBottomWidth: 0,
    marginBottom: -1,
  },
  liveStatsButton: {
    paddingVertical: 10,
    marginTop: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  liveStatsText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 0,
    paddingHorizontal: 28,
    paddingVertical: 20,
  },
  footerText: {
    textAlign: 'left',
    fontFamily: "Poppins-Light",
    fontSize: 12,
    lineHeight: 20,
  },
});