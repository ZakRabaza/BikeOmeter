import React, { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

import colors from "../../config/colors";

import Button from "../Button";
import Text from "../Text";

import useApi from "../../hooks/useApi";
import usersApi from "../../api/users";

function AgePicker({ setModalOpen, userObject, onUpdateUser }) {
  const updateUserApi = useApi(usersApi.updateUser);
  const [date, setDate] = useState(new Date(userObject.birthDay));
  const [error, setError] = useState();

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    DateTimePickerAndroid.open({
      display: "default",
      value: date,
      onChange,
      mode: currentMode,
      is24Hour: true,
    });
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const handleSubmit = async (birthDay) => {
    const userInfo = {
      ...userObject,
      birthDay: birthDay,
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
      <Text style={styles.text}>Select your birthdate:</Text>
      <Button
        onPress={showDatepicker}
        title={date.toDateString("en-GB", options)}
        color="dark"
      />
      <TouchableOpacity
        style={styles.validateButton}
        onPress={() => {
          handleSubmit(date);
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

export default AgePicker;
