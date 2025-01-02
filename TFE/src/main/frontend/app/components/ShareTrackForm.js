import React, { useState, useEffect } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AppButton from "./Button";

function ShareTrackForm({ onSubmit, initialValues, buttonTitle }) {
  const [bikeType, setBikeType] = useState(initialValues.bikeType || "");
  const [routeType, setRouteType] = useState(initialValues.routeType || "");
  const [location, setLocation] = useState(initialValues.location || "");
  const [comment, setComment] = useState(initialValues.comment || "");

  useEffect(() => {
    if (initialValues) {
      setBikeType(initialValues.bikeType || "");
      setRouteType(initialValues.routeType || "");
      setLocation(initialValues.location || "");
      setComment(initialValues.comment || "");
    }
  }, [initialValues]);

  const handleSubmit = () => {
    onSubmit({ bikeType, routeType, location, comment });
  };

  return (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Add information.</Text>

      <Picker
        selectedValue={bikeType}
        onValueChange={(itemValue) => setBikeType(itemValue)}
      >
        <Picker.Item label="All Bike Types" value="" />
        <Picker.Item label="Mountain Bike" value="Mountain" />
        <Picker.Item label="Gravel Bike" value="Gravel" />
        <Picker.Item label="Road Bike" value="Road" />
        <Picker.Item label="Hybrid Bike" value="Hybrid" />
        <Picker.Item label="Electric Bike" value="Electric" />
        <Picker.Item label="Folding Bike" value="Folding" />
        <Picker.Item label="Cargo Bike" value="Cargo" />
        <Picker.Item label="Fixed-Gear Bike" value="Fixie" />
        <Picker.Item label="BMX" value="BMX" />
        <Picker.Item label="Tandem Bike" value="Tandem" />
      </Picker>

      <Picker
        selectedValue={routeType}
        onValueChange={(itemValue) => setRouteType(itemValue)}
      >
        <Picker.Item label="All Route Types" value="" />
        <Picker.Item label="City" value="City" />
        <Picker.Item label="Nature" value="Nature" />
        <Picker.Item label="Hybrid" value="Hybrid" />
        <Picker.Item label="Mountain" value="Mountain" />
        <Picker.Item label="Countryside" value="Countryside" />
        <Picker.Item label="Forest" value="Forest" />
        <Picker.Item label="Beach" value="Beach" />
        <Picker.Item label="Hill" value="Hill" />
        <Picker.Item label="Long Distance" value="Long Distance" />
        <Picker.Item label="Bike Path" value="Bike Path" />
        <Picker.Item label="Urban" value="Urban" />
        <Picker.Item label="Rural" value="Rural" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        style={styles.input}
        placeholder="Comment"
        value={comment}
        onChangeText={setComment}
      />

      <AppButton title={buttonTitle} onPress={handleSubmit} color="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
});

export default ShareTrackForm;
