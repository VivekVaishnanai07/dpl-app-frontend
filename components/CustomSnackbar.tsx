import { useSnackbar } from "@/context/SnackbarContext";
import React from "react";
import { Snackbar } from "react-native-paper";

const CustomSnackbar = () => {
  const { snackbar } = useSnackbar();

  return (
    <Snackbar
      visible={snackbar.visible}
      style={{ borderRadius: 18 }}
      onDismiss={() => { }}>
      {snackbar.message}
    </Snackbar>
  );
};

export default CustomSnackbar;
