import Colors from '@/constants/Colors';
import { useSnackbar } from '@/context/SnackbarContext';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { authenticate } from '@/services/tokenService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, TextInput } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const { theme } = useTheme();
  const { fetchUserData } = useUser();
  const { showSnackbar } = useSnackbar();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const navigation = useNavigation<any>();

  const handleSubmit = async () => {
    if (!email.trim() && !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    try {
      const userPushToken: any = await AsyncStorage.getItem("expoPushToken");

      if (!userPushToken) {
        console.warn("No Expo push token found.");
      }

      const data = await authenticate(email, password, userPushToken);

      if (data?.token) {
        setTimeout(() => {
          navigation.navigate('(tabs)');
        }, 100)
        showSnackbar("Login Successful");
        fetchUserData();
      } else {
        Alert.alert("Error", data.message || "Invalid email or password");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response) {
        // Server responded with a status code other than 2xx
        Alert.alert("Error", error.response.data?.message || "Invalid email or password");
      } else if (error.request) {
        // No response from the server
        Alert.alert("Error", "Network error. Please check your internet connection.");
      } else {
        // Something else went wrong
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={[styles.leftSection, { backgroundColor: Colors[theme].tabBarIndicator }]}>
          <Image source={require('../assets/images/logo.png')} style={styles.image} />
        </View>
        <View style={styles.rightSection}>
          <Text style={[styles.title, { color: Colors[theme].tabBarIndicator }]}>Login</Text>
          <TextInput
            label="Email"
            activeOutlineColor={Colors[theme].tabBarIndicator}
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            contentStyle={{ fontFamily: "Poppins-Regular", fontSize: 16 }}
            textColor='#000'

          />
          <TextInput
            label="Password"
            activeOutlineColor={Colors[theme].tabBarIndicator}
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            textColor='#000'
            contentStyle={{ fontFamily: "Poppins-Regular", fontSize: 16 }}
            secureTextEntry={secureText}
            right={
              <TextInput.Icon
                icon={secureText ? "eye-off" : "eye"}
                onPress={() => setSecureText(!secureText)}
              />}
          />
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[styles.button, { backgroundColor: Colors[theme].tabBarIndicator }]}
            labelStyle={styles.buttonText}
          >
            Sign In
          </Button>
          <TouchableOpacity onPress={() => Alert.alert("Coming Soon", "This feature is under development!")}>
            <Text style={[styles.registerLink, { color: Colors[theme].tabBarIndicator }]}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  leftSection: {
    height: height / 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSection: {
    backgroundColor: "#fff",
    marginTop: -50,
    borderRadius: 20,
    marginHorizontal: 10,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    width: width / 2,
    height: width / 2,
    resizeMode: 'contain',
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    paddingVertical: 10,
  },
  buttonText: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#fff"
  },
  registerLink: {
    textAlign: 'center',
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    marginTop: 20,
  },
});

export default LoginScreen;
