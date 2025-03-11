import NetInfo from "@react-native-community/netinfo";
import * as Updates from "expo-updates";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Modal, Portal } from "react-native-paper";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

const NoInternetModal = () => {
  const [visible, setVisible] = useState(true);
  const [isConnected, setIsConnected] = useState<any>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        setVisible(true);
      }
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRetry = async () => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      setIsConnected(true);
      setVisible(false);
      reloadApp();
    }
  };

  const reloadApp = async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error("Error reloading app:", error);
    }
  };

  return (
    <>
      {!isConnected &&
        (
          <Portal>
            <Modal visible={visible} dismissable={false} contentContainerStyle={styles.modalContainer}>
              <Image source={require("../assets/images/no-wifi.png")} style={{ width: width * 0.18, height: width * 0.18 }} />
              <Text style={styles.title}>Oops! No Internet!</Text>
              <Text style={styles.message}>Looks like you are facing a temporary network interruption.</Text>
              <Text style={styles.message}>Please check your network connection.</Text>
              <TouchableOpacity onPress={handleRetry} style={styles.button}>
                <Image source={require("../assets/images/refresh.png")} style={{
                  width: width * 0.10, height: width * 0.10, marginLeft: 4,
                  marginTop: 2,
                }} />
              </TouchableOpacity>
            </Modal>
          </Portal>
        )
      }
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    alignItems: "center",
    backgroundColor: "white",
    padding: width * 0.05,
    borderRadius: width * 0.04,
    width: "90%",
    alignSelf: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  title: {
    fontSize: width * 0.06,
    fontFamily: "Poppins-Medium",
    marginVertical: height * 0.015,
    textAlign: "center",
  },
  message: {
    fontSize: width * 0.04,
    textAlign: "center",
    color: "#333",
    fontFamily: "Poppins-Regular",
    marginBottom: height * 0.015,
  },
  button: {
    marginTop: height * 0.01,
    backgroundColor: "#eee",
    padding: width * 0.010,
    borderRadius: 50,
  },
});

export default NoInternetModal;