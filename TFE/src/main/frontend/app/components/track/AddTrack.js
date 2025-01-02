import React, { useContext } from "react";
import { Alert, StyleSheet } from "react-native";

import AppButton from "../Button";

import useApi from "../../hooks/useApi";
import useAuth from "../../auth/useAuth";

import tracksApi from "../../api/tracks";
import LocationsContext from "../../hooks/locationsContext";
import MarkersContext from "../../hooks/markersContext";
import StartTimeContext from "../../hooks/startTimeContext";
import StopTimeContext from "../../hooks/stopTimeContext";
import PauseTimeContext from "../../hooks/pauseTimeContext";

function AddTrack() {
  const { user } = useAuth();

  const [locations, setLocations] = useContext(LocationsContext);
  const [markers, setMarkers] = useContext(MarkersContext);
  const [startTime, setStartTime] = useContext(StartTimeContext);
  const [stopTime, setStopTime] = useContext(StopTimeContext);
  const [pauseTime, setPauseTime] = useContext(PauseTimeContext);

  const userEmail = {
    email: user.sub,
  };

  const locationsDataTemp = {
    locations: locations,
    markers: markers,
    startTime: startTime,
    stopTime: stopTime,
    pauseTime: pauseTime,
    userEmail: userEmail.email,
  };

  const addLocationsApi = useApi(tracksApi.addLocations);

  const handleSubmitAddLocations = async () => {
    addLocationsApi.request(locationsDataTemp);
  };

  const trackAlert = () =>
    Alert.alert("Save Track ?", "Do you want to save your track ?", [
      {
        text: "No",
        onPress: () => console.log("No Pressed"),
      },
      { text: "Yes", onPress: () => handleSubmitAddLocations() },
    ]);

  return (
    <AppButton
      color={"medium"}
      onPress={trackAlert}
      style={styles.button}
      title={"Add Track"}
    />
  );
}
export default AddTrack;

const styles = StyleSheet.create({
  button: {
    alignItems: "stretch",
    alignContent: "flex-end",
  },
});
