import React, { useContext, useState, useMemo, useEffect } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Alert,
  TextInput,
  Text,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import Modal from "react-native-modal";

import colors from "../../../config/colors";
import Screen from "../../../components/Screen";
import AppButton from "../../../components/Button";

import LocationsContext from "../../../hooks/locationsContext";
import useLocation from "../../../hooks/useLocation";
import StartStopContext from "../../../hooks/startStopContext";
import PauseContext from "../../../hooks/pauseContext";
import MarkersContext from "../../../hooks/markersContext";

function MapScreen() {
  const [locations] = useContext(LocationsContext);
  const locationStart = useLocation();

  const [markers, setMarkers] = useContext(MarkersContext);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [markerDetails, setMarkerDetails] = useState({ name: "", comment: "" });

  const [isLocationStarted] = useContext(StartStopContext);
  const [isLocationPaused] = useContext(PauseContext);

  const [region, setRegion] = useState({
    latitude: locationStart ? locationStart.latitude : 59.6904615,
    longitude: locationStart ? locationStart.longitude : 9.21255,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const polylineCoordinates = useMemo(
    () => (locations ? locations : []),
    [locations]
  );

  useEffect(() => {
    if (locationStart) {
      setRegion({
        latitude: locationStart.latitude,
        longitude: locationStart.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [locationStart]);

  // Function to handle long press and add a marker
  const handleLongPress = (event) => {
    if (!isLocationStarted || !isLocationPaused) {
      Alert.alert(
        "Action not allowed",
        "You must start and pause location tracking before adding markers."
      );
      return;
    }
    const newMarker = {
      name: "",
      coordinate: event.nativeEvent.coordinate,
      comment: "",
      key: Math.random().toString(),
    };
    setMarkers((currentMarkers) => [...currentMarkers, newMarker]);
  };

  // Function to select a marker
  const handleMarkerPress = (marker) => {
    if (!isLocationStarted || !isLocationPaused) {
      Alert.alert(
        "Action not allowed",
        "You must start and pause location tracking before editing markers."
      );
      return;
    }
    setSelectedMarker(marker);
    setMarkerDetails({ name: marker.name, comment: marker.comment });
    setModalVisible(true);
  };

  const handleSaveMarkerDetails = () => {
    if (selectedMarker) {
      setMarkers((currentMarkers) =>
        currentMarkers.map((marker) =>
          marker.key === selectedMarker.key
            ? {
                ...marker,
                name: markerDetails.name,
                comment: markerDetails.comment,
              }
            : marker
        )
      );
      setSelectedMarker(null);
      setModalVisible(false);
    }
  };

  const handleDeleteMarker = () => {
    if (selectedMarker) {
      setMarkers((currentMarkers) =>
        currentMarkers.filter((marker) => marker.key !== selectedMarker.key)
      );
      setSelectedMarker(null);
      setModalVisible(false);
    }
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation
          showsMyLocationButton
          onLongPress={handleLongPress}
        >
          <Polyline
            coordinates={polylineCoordinates}
            strokeColor="#000" // fallback for when `strokeColors` is not supported by the map provider
            strokeColors={[
              "#7F0000",
              "#00000000", // no color, creates a "long" gradient between the previous and next coordinate
              "#B24112",
              "#E5845C",
              "#238C23",
              "#7F0000",
            ]}
            strokeWidth={6}
          />
          {markers.map((marker) => (
            <Marker
              key={marker.key}
              coordinate={marker.coordinate}
              onPress={() => handleMarkerPress(marker)}
            />
          ))}
        </MapView>
        <Modal isVisible={isModalVisible}>
          <View style={styles.modalContent}>
            <Text>Edit Marker Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={markerDetails.name}
              onChangeText={(text) =>
                setMarkerDetails({ ...markerDetails, name: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Comment"
              value={markerDetails.comment}
              onChangeText={(text) =>
                setMarkerDetails({ ...markerDetails, comment: text })
              }
            />
            <AppButton
              title="Save"
              onPress={handleSaveMarkerDetails}
              color="secondary"
            />
            <AppButton
              title="Delete"
              onPress={handleDeleteMarker}
              color="primary"
            />
            <AppButton
              title="Cancel"
              onPress={() => setModalVisible(false)}
              color="dark"
            />
          </View>
        </Modal>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 5,
    paddingBottom: 0,
    backgroundColor: colors.light,
  },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: "100%",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
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

export default MapScreen;
