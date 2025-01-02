import React, { useEffect, useContext } from "react";
import { Alert, StyleSheet } from "react-native";

import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";

import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

import AppButton from "../Button";

import StartStopContext from "../../hooks/startStopContext";
import PauseContext from "../../hooks/pauseContext";

import LocationContext from "../../hooks/locationContext";
import LocationsContext from "../../hooks/locationsContext";
import MarkersContext from "../../hooks/markersContext";
import StartTimeContext from "../../hooks/startTimeContext";
import StopTimeContext from "../../hooks/stopTimeContext";
import PauseTimeContext from "../../hooks/pauseTimeContext";

const LOCATION_TASK_NAME = "LOCATION_TASK_NAME";
let foregroundSubscription = null;

// Define the background task for location tracking
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    // Extract location coordinates from data
    const { locations } = data;
    const location = locations[0];
    if (location) {
      console.log("Location in background", location.coords);
    }
  }
});

// Variable used to save the locations in the asyncStorage
let storageLocations = [];

// Function to save locations to AsyncStorage
const storeLocationsData = async () => {
  try {
    const jsonValueStore = JSON.stringify(storageLocations);
    await AsyncStorage.setItem("locations", jsonValueStore);
  } catch (e) {
    console.log("storing error");
  }
  console.log("Save Done.");
};

// Function to reset locations in AsyncStorage
const resetLocationsData = async () => {
  try {
    await AsyncStorage.setItem("locations", JSON.stringify([]));
  } catch (e) {
    console.log("storing error");
  }
  console.log("Reset Done.");
};

// Function to retrieve stored locations from AsyncStorage
const getLocationsData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("locations");
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.log("getting data error");
  }
  console.log("Pull Done.");
};

// Check if the new location is sufficiently different from the last one
const isSignificantChange = (newLocation, lastLocation) => {
  const distanceThreshold = 0.00001; // Define a threshold for minimal movement
  const latDifference = Math.abs(newLocation.latitude - lastLocation.latitude);
  const lonDifference = Math.abs(
    newLocation.longitude - lastLocation.longitude
  );
  return latDifference > distanceThreshold || lonDifference > distanceThreshold;
};

function AppLocation() {
  const [startStopStatus, setStartStopStatus] = useContext(StartStopContext);
  const [pauseStatus, setPauseStatus] = useContext(PauseContext);

  const [location, setLocation] = useContext(LocationContext);
  const [locations, setLocations] = useContext(LocationsContext);
  const [markers, setMarkers] = useContext(MarkersContext);

  const [startTime, setStartTime] = useContext(StartTimeContext);
  const [stopTime, setStopTime] = useContext(StopTimeContext);
  const [pauseTime, setPauseTime] = useContext(PauseTimeContext);

  const [elementVisible] = useContext(StartStopContext);

  function resetPause() {
    setPauseTime(0);
    setPauseStatus(false);
  }

  const startStopHandlePress = () => {
    if (startStopStatus) {
      stopForegroundUpdate();
      setPauseStatus(false);
    } else {
      startForegroundUpdate();
    }
    setStartStopStatus(!startStopStatus);
  };

  const pauseHandlePress = () => {
    if (pauseStatus) {
      startForegroundUpdate();
    } else {
      pauseForegroundUpdate();
    }
    setPauseStatus(!pauseStatus);
  };

  useEffect(() => {
    let interval = null;
    if (pauseStatus) {
      interval = setInterval(() => {
        setPauseTime((seconds) => seconds + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [pauseStatus]);

  // Request permissions right after starting the app
  useEffect(() => {
    const requestPermissions = async () => {
      const foreground = await Location.requestForegroundPermissionsAsync();
      if (foreground.granted)
        await Location.requestBackgroundPermissionsAsync();
    };
    requestPermissions();
  }, []);

  // Start location tracking in foreground
  const startForegroundUpdate = async () => {
    // Check if foreground permission is granted

    const { granted } = await Location.getForegroundPermissionsAsync();
    if (!granted) {
      Alert.alert(
        "Location tracking denied, go to the settings to enable the permissions."
      );
      console.log("location tracking denied");
      return;
    }

    // Make sure that foreground location tracking is not running
    foregroundSubscription?.remove();

    // Setting the start time with moment()
    if (!startStopStatus) {
      const start = moment().format();
      setStartTime(start);
      resetPause();
      setMarkers([]);
    }

    // Start watching position in real-time
    foregroundSubscription = await Location.watchPositionAsync(
      {
        // For better logs, we set the accuracy to the most sensitive option
        accuracy: Location.Accuracy.BestForNavigation,
      },
      (location) => {
        if (
          storageLocations.length === 0 ||
          isSignificantChange(
            location.coords,
            storageLocations[storageLocations.length - 1]
          )
        ) {
          storageLocations.push({
            accuracy: location.coords.accuracy,
            altitude: location.coords.altitude,
            altitudeAccuracy: location.coords.altitudeAccuracy,
            heading: location.coords.heading,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            speed: location.coords.speed,
            timestamp: new Date().getTime(),
          });
          storeLocationsData(); // Store data locally
          setLocation(location.coords);
          setLocations([...storageLocations]);
        }
      }
    );
  };

  // Stop location tracking in foreground
  const stopForegroundUpdate = async () => {
    foregroundSubscription?.remove();

    // Setting the stop time with moment()
    const stop = moment().format();
    setStopTime(stop);

    // Uncomment to console.log Locations data
    // const locations = await getLoactionsData();

    await resetLocationsData();
    const res = await AsyncStorage.getItem("locations");
    storageLocations = JSON.parse(res) || [];
  };

  // Pause location tracking in foreground
  const pauseForegroundUpdate = async () => {
    foregroundSubscription?.remove();
  };

  return (
    <>
      {elementVisible ? (
        <AppButton
          color={pauseStatus ? "primary" : "secondary"}
          onPress={pauseHandlePress}
          style={styles.button}
          title={pauseStatus ? "Resume" : "Pause"}
        />
      ) : null}
      <AppButton
        color={startStopStatus ? "primary" : "secondary"}
        onPress={startStopHandlePress}
        style={styles.button}
        title={startStopStatus ? "Stop" : "Start"}
      />
    </>
  );
}
export default AppLocation;

const styles = StyleSheet.create({
  button: {
    alignItems: "stretch",
    alignContent: "flex-end",
  },
});
