import ImageViewer from '@/components/ImageViewer';
import Colors from '@/constants/Colors';
import { useSnackbar } from '@/context/SnackbarContext';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { decodeJWT } from '@/services/tokenService';
import { getUserDetails, updateUserDetails } from '@/services/userService';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Button, Dialog, Portal, Text, TextInput } from 'react-native-paper';

const EditProfileScreen = () => {
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();
  const { user, fetchUserData } = useUser();
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [profileImage, setProfileImage] = useState<any>('https://avatar.iran.liara.run/public');
  const [visible, setVisible] = useState(false);
  const [originalData, setOriginalData] = useState<any>({});

  useEffect(() => {
    if (!user) {
      getUserData();
    } else {
      setUserId(user.id);
      setEmail(user.email);
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setRole(user.role);
      setProfileImage(user.appUserImg);
      setOriginalData(user);
    }
  }, [user]);

  const getUserData = async () => {
    try {
      let user: any = await decodeJWT();
      const userDetails = await getUserDetails(user.id);
      setOriginalData(userDetails);
      setUserId(user.id);
      setEmail(userDetails.email);
      setFirstName(userDetails.first_name);
      setLastName(userDetails.last_name);
      setRole(userDetails.role);
      setProfileImage(userDetails.appUserImg);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const showDialog = async () => {
    // Request Camera & Media Library Permissions
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert('Permission Required', 'We need camera and media permissions to proceed!');
      return;
    }

    setVisible(true); // Show dialog only if permissions are granted
  };

  const hideDialog = () => setVisible(false);

  const takePhotoHandler = async () => {
    hideDialog();
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
      base64: true
    });

    if (!result.canceled) {
      setProfileImage(`data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`);
    } else {
      Alert.alert('Cancelled', 'You did not take a photo.');
    }
  };

  const chooseFromGalleryHandler = async () => {
    hideDialog();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
      base64: true
    });

    if (!result.canceled) {
      setProfileImage(`data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`);
    } else {
      Alert.alert('Cancelled', 'You did not select any image.');
    }
  };

  const updateProfileData = async () => {
    try {
      if (!userId) return;
      // Check for changes
      if (
        firstName === originalData.first_name &&
        lastName === originalData.last_name &&
        profileImage === originalData.userImg
      ) {
        Alert.alert("No Changes", "No updates were made to your profile. Please modify details before saving.");
        return;
      }

      const payload: any = {
        id: userId,
        first_name: firstName,
        last_name: lastName,
        userImg: profileImage
      }
      // API Call
      const response = await updateUserDetails(userId, payload);
      if (response) {
        getUserDetails(userId);
        getUserData();
        fetchUserData();
        showSnackbar("Your profile has been updated successfully!");
      } else {
        Alert.alert("Error", response.message || "Failed to update profile. Please try again.");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred while updating your profile.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView contentContainerStyle={[styles.screen, { backgroundColor: Colors[theme].tabBarIndicator }]} keyboardShouldPersistTaps="handled">
        <View style={[styles.container, { backgroundColor: Colors[theme].greyBackground }]}>
          <ImageViewer imgSource={profileImage} selectedImage={profileImage} onEditPress={showDialog} />
          <Text style={styles.name}>{originalData.first_name} {originalData.last_name}</Text>
          <Text style={styles.role}>{role}</Text>
          <Text style={[styles.labelText, { color: Colors[theme].text }]}>Email Address</Text>
          <TextInput mode='outlined' value={email} disabled style={styles.input} outlineStyle={styles.inputOutline} contentStyle={styles.inputContent} />
          <Text style={[styles.labelText, { color: Colors[theme].text }]}>First Name</Text>
          <TextInput mode='outlined' value={firstName} onChangeText={setFirstName} style={styles.input} outlineStyle={styles.inputOutline} contentStyle={styles.inputContent} />
          <Text style={[styles.labelText, { color: Colors[theme].text }]}>Last Name</Text>
          <TextInput mode='outlined' value={lastName} onChangeText={setLastName} style={styles.input} outlineStyle={styles.inputOutline} contentStyle={styles.inputContent} />

          <Button mode='contained' style={[styles.saveBtn, { backgroundColor: Colors[theme].tabBarIndicator }]} labelStyle={styles.saveLabelText} onPress={updateProfileData}>Save</Button>
        </View>

        {/* Image Selection Modal */}
        <Portal>
          <Dialog visible={visible} style={{ backgroundColor: Colors[theme].secondaryBackground }} onDismiss={hideDialog}>
            <Dialog.Title style={styles.modalTitle}>Select Option</Dialog.Title>
            <Dialog.Content>
              <Button mode="outlined" onPress={takePhotoHandler} style={[styles.modalButton, { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }]} labelStyle={[styles.modalButtonText, { color: Colors[theme].text }]}>
                Take a Photo
              </Button>
              <Button mode="outlined" onPress={chooseFromGalleryHandler} style={[styles.modalButton, { borderRadius: 12 }]} labelStyle={[styles.modalButtonText, { color: Colors[theme].text }]}>
                Choose from Gallery
              </Button>
              <Button mode="outlined" onPress={hideDialog} style={styles.modalCancelButton} labelStyle={[styles.modalButtonText, { color: Colors[theme].text }]}>
                Cancel
              </Button>
            </Dialog.Content>
          </Dialog>
        </Portal>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 18
  },
  container: {
    flex: 1,
    padding: 16,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    width: "100%",
    alignItems: "center"
  },
  name: {
    marginVertical: 10,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: "Poppins-SemiBold"
  },
  role: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 14,
    fontFamily: "Poppins-Light",
    marginBottom: 20,
  },
  labelText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    alignSelf: "flex-start",
    paddingLeft: 8
  },
  input: {
    height: 55,
    marginBottom: 10,
    backgroundColor: "#fff",
    alignSelf: "stretch"
  },
  inputOutline: {
    borderRadius: 20,
    borderWidth: 0
  },
  inputContent: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#000"
  },
  saveBtn: {
    marginTop: 100,
    height: 50,
    width: 100,
    justifyContent: "center",
  },
  saveLabelText: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "Poppins-Medium"
  },
  modalTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 22,
  },
  modalButton: {
    padding: 8,
    marginBottom: 8,
  },
  modalCancelButton: {
    padding: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 16
  }
});

export default EditProfileScreen;