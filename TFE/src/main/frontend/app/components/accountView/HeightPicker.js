import React, { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { Picker } from "@react-native-picker/picker";

import Text from "../Text";
import colors from "../../config/colors";

import { height as dataHeight } from "../../config/accountData";

import useApi from "../../hooks/useApi";
import usersApi from "../../api/users";

function HeightPicker({ setModalOpen, userObject, onUpdateUser }) {
  const updateUserApi = useApi(usersApi.updateUser);
  const [value, setValue] = useState(userObject.height.toString());
  const [error, setError] = useState();

  const pickerData = (data) => {
    return data.map((val, index) => (
      <Picker.Item label={val} value={val} key={index} />
    ));
  };

  const handleSubmit = async (height) => {
    const userInfo = {
      ...userObject,
      height: height,
    };
    const result = await updateUserApi.request(userInfo);

    if (!result.ok) {
      if (result.data) setError(result.data.message);
      else {
        setError("An unexpected error occurred.");
      }
    } else {
      onUpdateUser(); // Refresh the user data after a successful update
    }

    setModalOpen({ show: false });
  };

  return (
    <>
      <Text style={styles.text}>Choose your height.</Text>
      <Picker
        selectedValue={value}
        style={{ height: 50, width: "100%" }}
        onValueChange={(itemValue, itemIndex) => setValue(itemValue)}
        mode="dropdown"
      >
        {pickerData(dataHeight)}
      </Picker>
      <TouchableOpacity
        style={styles.validateButton}
        onPress={() => {
          handleSubmit(value);
        }}
      >
        <Text> Validate </Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  text: {
    alignSelf: "center",
    marginVertical: 15,
    marginHorizontal: 15,
  },
  validateButton: {
    alignSelf: "center",
    backgroundColor: colors.secondary,
    borderRadius: 25,
    padding: 15,
  },
});

export default HeightPicker;
