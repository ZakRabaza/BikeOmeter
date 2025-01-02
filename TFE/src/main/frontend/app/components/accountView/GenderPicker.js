import React, { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Text from "../Text";
import colors from "../../config/colors";
import { gender as dataGender } from "../../config/accountData";
import useApi from "../../hooks/useApi";
import usersApi from "../../api/users";

function GenderPicker({ setModalOpen, userObject, onUpdateUser }) {
  const updateUserApi = useApi(usersApi.updateUser);
  const values = { MALE: "Male", FEMALE: "Female" };
  const [value, setValue] = useState(values[userObject.gender]);
  const [error, setError] = useState();

  const pickerData = (data) => {
    return data.map((val, index) => (
      <Picker.Item label={val} value={val} key={index} />
    ));
  };

  const handleSubmit = async (gender) => {
    const userInfo = {
      ...userObject,
      gender: gender,
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
      <Text style={styles.text}>Choose your gender.</Text>
      <Picker
        selectedValue={value}
        style={{ height: 50, width: "100%" }}
        onValueChange={(itemValue, itemIndex) => setValue(itemValue)}
        mode="dropdown"
      >
        {pickerData(dataGender)}
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

export default GenderPicker;
