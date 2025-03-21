import Colors from "@/constants/Colors";
import { useSnackbar } from "@/context/SnackbarContext";
import { useTheme } from "@/context/ThemeContext";
import { createMatch } from "@/services/matcheService";
import { getTeams } from "@/services/teamService";
import { decodeJWT } from "@/services/tokenService";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Button, Text, TextInput } from "react-native-paper";

interface Team {
  id: number;
  full_name: string;
  app_team_icon: string;
}

interface MatchDetails {
  match_no: number;
  season_year: number;
  match_price: number;
  venue: string;
  tournament_id: number | null;
  date: Date;
  team_1: number | null;
  team_2: number | null;
}

const CreateMatchScreen: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const [matchDetails, setMatchDetails] = useState<MatchDetails>({
    match_no: 0,
    season_year: 2025,
    match_price: 10,
    venue: "",
    tournament_id: tournamentId,
    date: new Date(),
    team_1: null,
    team_2: null
  });
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const user = await decodeJWT() as any;
        if (user?.tournamentId) {
          setTournamentId(user.tournamentId);
          const response = await getTeams(user.tournamentId);
          setTeamList(response);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, []);

  const handleChange = (field: keyof MatchDetails, value: any) => {
    setMatchDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = (date: Date) => {
    handleChange("date", date);
    setDatePickerVisibility(false);
  };

  const handleSubmit = async () => {
    // Ensure tournament ID is assigned
    if (tournamentId === null) {
      showSnackbar("Tournament ID is missing.");
      return;
    }

    if (matchDetails.team_1 === matchDetails.team_2) {
      return showSnackbar("Home team and away team cannot be the same.");
    }

    // Validate required fields
    if (
      !matchDetails.match_no ||
      !matchDetails.season_year ||
      !matchDetails.match_price ||
      !matchDetails.venue ||
      !matchDetails.team_1 ||
      !matchDetails.team_2 ||
      !matchDetails.date
    ) {
      showSnackbar("All fields are required.");
      return;
    }

    // Prepare match data
    const matchData = {
      ...matchDetails,
      tournament_id: tournamentId,
    };
    try {
      const response = await createMatch(matchData);
      if (response.status !== 200) {
        showSnackbar("Error creating match");
      }
      router.replace("/matches");
      showSnackbar("Match created successfully!");
    } catch (error) {
      console.error("Error creating match:", error);
    }
  };


  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].tabBarIndicator }]}>
      <View style={[styles.innerContainer, { backgroundColor: Colors[theme].greyBackground }]}>
        <ScrollView style={styles.scrollContainer}>
          {/** Match Number */}
          <TextInputField
            label="Match No."
            value={matchDetails.match_no.toString()}
            keyboardType="numeric"
            onChangeText={(text) => handleChange("match_no", parseInt(text.replace(/[^0-9]/g, "")) || 0)}
          />

          {/** Season Number */}
          <TextInputField
            label="Season Year"
            value={matchDetails.season_year.toString()}
            keyboardType="numeric"
            onChangeText={(text) => handleChange("season_year", parseInt(text.replace(/[^0-9]/g, "")) || 2025)}
          />

          {/** Match Price */}
          <TextInputField
            label="Match Price"
            value={matchDetails.match_price.toString()}
            keyboardType="numeric"
            onChangeText={(text) => handleChange("match_price", parseInt(text.replace(/[^0-9]/g, "")) || 10)}
          />

          {/** Home Team */}
          <DropdownField
            label="Home Team"
            data={teamList}
            selectedValue={matchDetails.team_1}
            onChange={(team) => handleChange("team_1", team.id)}
          />

          {/** Away Team */}
          <DropdownField
            label="Away Team"
            data={teamList}
            selectedValue={matchDetails.team_2}
            onChange={(team) => handleChange("team_2", team.id)}
          />

          {/** Venue */}
          <TextInputField
            label="Venue"
            value={matchDetails.venue}
            onChangeText={(text) => handleChange("venue", text)}
          />

          {/** Match Date & Time */}
          <Text style={[styles.labelText, { color: Colors[theme].text }]}>Match Date & Time</Text>
          <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
            <TextInput
              mode="outlined"
              outlineStyle={styles.inputOutline}
              contentStyle={{ color: "#000", fontFamily: "Poppins-Regular" }}
              value={matchDetails.date.toLocaleString()}
              editable={false}
              style={styles.dateInput}
            />
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            themeVariant="light"
            onConfirm={handleConfirm}
            onCancel={() => setDatePickerVisibility(false)}
          />

          <Button
            mode="contained"
            labelStyle={{ fontFamily: "Poppins-Medium", fontSize: 16, color: "#fff" }}
            style={{ borderRadius: 20, marginTop: 20, height: 50, alignItems: "center", justifyContent: "center", width: 200, alignSelf: "center", backgroundColor: Colors[theme].tabBarIndicator }}
            onPress={handleSubmit}>Create Match</Button>
        </ScrollView>
      </View>
    </View>
  );
};

interface TextInputFieldProps {
  label: string;
  value: string;
  keyboardType?: "default" | "numeric";
  onChangeText: (text: string) => void;
}

const TextInputField: React.FC<TextInputFieldProps> = ({ label, value, keyboardType = "default", onChangeText }) => {
  const { theme } = useTheme();
  return (
    <>
      <Text style={[styles.labelText, { color: Colors[theme].text }]}>{label}</Text>
      <TextInput
        mode="outlined"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={styles.input}
        outlineStyle={styles.inputOutline}
        contentStyle={styles.inputContent}
      />
    </>
  );
};

interface DropdownFieldProps {
  label: string;
  data: Team[];
  selectedValue: number | null;
  onChange: (team: Team) => void;
}

const DropdownField: React.FC<DropdownFieldProps> = ({ label, data, selectedValue, onChange }) => {
  const { theme } = useTheme();
  const selectedTeam = data.find((team) => team.id === selectedValue);

  return (
    <>
      <Text style={[styles.labelText, { color: Colors[theme].text }]}>{label}</Text>
      <Dropdown
        style={[styles.input, { borderRadius: 18 }]}
        data={data}
        placeholder="Select Team"
        labelField="full_name"
        valueField="id"
        value={selectedValue}
        placeholderStyle={{ paddingLeft: 8 }}
        onChange={onChange}
        renderItem={(item) => (
          <View style={styles.item}>
            <Image source={{ uri: item.app_team_icon }} style={styles.icon} />
            <Text style={{ color: "#000", fontFamily: "Poppins-Regular" }}>{item.full_name}</Text>
          </View>
        )}
        selectedTextStyle={{ color: "#000", fontFamily: "Poppins-Regular" }}
        renderLeftIcon={() =>
          selectedTeam ? <Image source={{ uri: selectedTeam.app_team_icon }} style={styles.icon} /> : null
        }
      />
    </>
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
  scrollContainer: { paddingHorizontal: 16, marginTop: 20 },
  labelText: { fontSize: 15, fontFamily: "Poppins-Regular", paddingLeft: 8 },
  input: { height: 55, marginBottom: 10, backgroundColor: "#fff" },
  inputOutline: { borderRadius: 20, borderWidth: 0 },
  inputContent: { fontSize: 16, fontFamily: "Poppins-Medium", color: "#000" },
  dateInput: { height: 55, backgroundColor: "#fff", marginBottom: 10, borderWidth: 0 },
  icon: { width: 40, height: 40, resizeMode: "contain", marginHorizontal: 10 },
  item: { flexDirection: "row", alignItems: "center", padding: 10 },
});

export default CreateMatchScreen;