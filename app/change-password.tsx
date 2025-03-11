import Colors from "@/constants/Colors";
import { useSnackbar } from "@/context/SnackbarContext";
import { useTheme } from "@/context/ThemeContext";
import { changePassword } from "@/services/authService";
import { decodeJWT, logout } from "@/services/tokenService";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { Button, Dialog, Divider, Portal, TextInput } from "react-native-paper";

const ChangePasswordScreen = () => {
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();
  const navigation = useNavigation<any>();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureEntryNew, setSecureEntryNew] = useState(true);
  const [secureEntryConfirm, setSecureEntryConfirm] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDisable, setIsDisable] = useState(true);
  const [warningMessage, setWarningMessage] = useState(
    "⚠️ Please make sure you remember and login with your new password. Changes are reflected in real-time."
  );

  useEffect(() => {
    setIsDisable(
      newPassword.trim().length === 0 ||
      confirmPassword.trim().length === 0
    );
  }, [newPassword, confirmPassword]);


  const handleChangePassword = () => {
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    if (!trimmedNewPassword || !trimmedConfirmPassword) {
      setWarningMessage("❌ Please fill in all fields!");
      return;
    }
    if (trimmedNewPassword.length < 6) {
      setWarningMessage("❌ Password must be at least 6 characters long!");
      return;
    }
    if (trimmedNewPassword !== trimmedConfirmPassword) {
      setWarningMessage("❌ Passwords do not match!")
      return;
    }

    setModalVisible(true);
  };

  const onSubmit = async () => {
    try {
      const user: any = await decodeJWT();
      if (user) {
        const data = await changePassword(user.id, newPassword, confirmPassword);
        if (data.message.startsWith("✅")) {
          showSnackbar("Password changed successfully!");
          await logout();
          navigation.navigate("login");
        } else {
          setWarningMessage(`❌ ${data.message || "Invalid email or password"}`);
        }
      } else {
        setWarningMessage("❌ Invalid or missing token.");
      }
    } catch (error: any) {
      console.error("Change password error:", error);

      if (error.response) {
        // Backend sent an error message
        setWarningMessage(`❌ ${error.response.data?.message || "Something went wrong!"}`);
      } else if (error.request) {
        // No response from backend
        setWarningMessage("❌ Network error. Please check your internet connection.");
      } else {
        // Unexpected error
        setWarningMessage("❌ An unexpected error occurred. Please try again.");
      }
    }

    setModalVisible(false);
    setNewPassword("");
    setConfirmPassword("");
    setIsDisable(true);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView contentContainerStyle={[styles.screen, { backgroundColor: Colors[theme].tabBarIndicator }]} keyboardShouldPersistTaps="handled">
        <View style={[styles.container, { backgroundColor: Colors[theme].greyBackground }]}>
          <Text style={[styles.labelText, { color: Colors[theme].text }]}>Create New Password</Text>
          <TextInput
            value={newPassword}
            onChangeText={(text) => setNewPassword(text)}
            secureTextEntry={secureEntryNew}
            mode="outlined"
            outlineStyle={styles.inputOutline}
            contentStyle={styles.inputContent}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={secureEntryNew ? "eye-off" : "eye"}
                onPress={() => setSecureEntryNew((prev) => !prev)} // ✅ Fix: Wrap in function
              />
            }
            style={styles.input}
          />
          <Text style={[styles.labelText, { color: Colors[theme].text }]}>Confirm New Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
            secureTextEntry={secureEntryConfirm}
            mode="outlined"
            outlineStyle={styles.inputOutline}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={secureEntryConfirm ? "eye-off" : "eye"}
                onPress={() => setSecureEntryConfirm((prev) => !prev)} // ✅ Fix: Wrap in function
              />
            }
            style={styles.input}
            theme={{ colors: { primary: "#000" } }}
          />

          <Divider bold={true} style={[styles.dividerLine, { backgroundColor: Colors[theme].border }]} />

          <View style={styles.warningContainer}>
            <Text style={[styles.warningText, { color: Colors[theme].tabBarIndicator }]}>{warningMessage}</Text>
          </View>

          <Button
            mode="contained"
            onPress={handleChangePassword}
            disabled={isDisable}
            style={[styles.button, { backgroundColor: isDisable ? "#ebecf0" : Colors[theme].tabBarIndicator, opacity: theme === 'dark' ? isDisable ? 0.5 : 1 : 1 }]}
            labelStyle={[styles.buttonText, { color: isDisable ? "#000" : "#fff" }]}
          >
            Change Password
          </Button>

          {/* Confirmation Modal */}
          <Portal>
            <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)} style={{ backgroundColor: Colors[theme].secondaryBackground }}>
              <Dialog.Title style={[styles.modalTitle, { color: Colors[theme].text }]}>Confirm Change</Dialog.Title>
              <Dialog.Content>
                <Text style={[styles.modalMessage, { color: Colors[theme].text }]}>Are you sure you want to change your password?</Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button labelStyle={[styles.modalButtonText, { color: Colors[theme].text }]} onPress={() => setModalVisible(false)}>Cancel</Button>
                <Button
                  labelStyle={[styles.modalButtonText, { color: Colors[theme].text }]}
                  onPress={onSubmit}>
                  Confirm
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

// Styles
const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 18 },
  scrollContainer: { flexGrow: 1 },
  container: { flex: 1, padding: 20, borderTopLeftRadius: 40, borderTopRightRadius: 40, width: "100%", alignSelf: "center", alignItems: "center" },
  labelText: { fontSize: 15, fontFamily: "Poppins-Regular", alignSelf: "flex-start", paddingLeft: 8 },
  input: { width: "100%", marginBottom: 15, height: 55, backgroundColor: "#fff" },
  inputOutline: { borderRadius: 24, borderColor: "#fff" },
  inputContent: { fontSize: 18 },
  dividerLine: { marginVertical: 20, width: "100%" },
  warningContainer: { marginBottom: 15 },
  warningText: { textAlign: "center", fontFamily: "Poppins-Light", fontSize: 13 },
  button: { width: "100%", height: 55, elevation: 4, position: "absolute", bottom: 50, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 16 },
  modalTitle: { fontSize: 20, fontFamily: "Poppins-SemiBold", marginBottom: 10 },
  modalMessage: { fontSize: 16, fontFamily: "Poppins-Regular" },
  modalButtonText: { fontSize: 16, fontFamily: "Poppins-Medium" },
});

export default ChangePasswordScreen;
