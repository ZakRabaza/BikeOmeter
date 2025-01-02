import React, { useState, useMemo, useEffect } from "react";
import { StyleSheet, View, TextInput, Alert } from "react-native";
import Modal from "react-native-modal";
import MapView, { Marker, Polyline } from "react-native-maps";
import colors from "../../../config/colors";
import Text from "../../../components/Text";
import markersApi from "../../../api/markers";
import Screen from "../../../components/Screen";
import AppButton from "../../../components/Button";

function MarkerEditScreen({ route, navigation }) {
  const { track } = route.params;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [markerName, setMarkerName] = useState("");
  const [markerComment, setMarkerComment] = useState("");

  // Extract polyCoordinates and format them for the Polyline component
  const coordinates = track.trackMap.polyCoordinates.map((coord) => ({
    latitude: coord.latitude,
    longitude: coord.longitude,
  }));

  const [markers, setMarkers] = useState([]);

  // Load markers from the backend
  useEffect(() => {
    fetchMarkers();
  }, []);

  const fetchMarkers = async () => {
    try {
      const result = await markersApi.getMarkersByTrackMapId(track.trackMap.id);
      if (result.ok) {
        setMarkers(
          result.data.map((marker) => ({
            id: marker.id,
            key: marker.id.toString(),
            name: marker.name,
            comment: marker.comment,
            coordinate: {
              latitude: marker.coordinate.latitude,
              longitude: marker.coordinate.longitude,
            },
          }))
        );
      } else {
        Alert.alert("Error", "Failed to fetch markers.");
      }
    } catch (error) {
      console.error("Failed to fetch markers:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const initialRegion = useMemo(
    () => ({
      latitude: coordinates[0].latitude,
      longitude: coordinates[0].longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }),
    [coordinates]
  );

  const handleLongPress = async (event) => {
    const newMarker = {
      name: "",
      coordinate: event.nativeEvent.coordinate,
      comment: "",
      key: Math.random().toString(),
      trackMapId: track.trackMap.id,
    };

    try {
      const result = await markersApi.addMarker(newMarker);
      if (result.ok) {
        fetchMarkers(); // Refresh markers from the backend
      } else {
        throw new Error("Could not save the marker");
      }
    } catch (error) {
      Alert.alert("Error", "Could not save the marker. Please try again.");
    }
  };

  const handleEditMarker = async () => {
    if (!selectedMarker) return;

    const updatedMarker = {
      ...selectedMarker,
      name: markerName,
      comment: markerComment,
    };

    try {
      const result = await markersApi.updateMarker(updatedMarker);
      if (result.ok) {
        fetchMarkers();
        closeModal();
      } else {
        throw new Error("Could not update the marker");
      }
    } catch (error) {
      Alert.alert("Error", "Could not update the marker. Please try again.");
    }
  };

  const handleDeleteMarker = async (markerId) => {
    try {
      const result = await markersApi.deleteMarker(markerId);
      if (result.ok) {
        fetchMarkers();
        closeModal();
      } else {
        throw new Error("Could not delete the marker");
      }
    } catch (error) {
      Alert.alert("Error", "Could not delete the marker. Please try again.");
    }
  };

  const openModal = (marker) => {
    setSelectedMarker(marker);
    setMarkerName(marker ? marker.name : "");
    setMarkerComment(marker ? marker.comment : "");
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setSelectedMarker(null);
    setIsModalVisible(false);
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          onLongPress={handleLongPress}
        >
          {/* Add Polyline to draw the track */}
          <Polyline
            coordinates={coordinates}
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
              title={marker.name}
              description={marker.comment}
              onPress={() => openModal(marker)}
            />
          ))}
        </MapView>

        <Modal visible={isModalVisible} animationType="slide">
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedMarker ? "Edit Marker" : "Add Marker"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={markerName}
              onChangeText={setMarkerName}
            />
            <TextInput
              style={styles.input}
              placeholder="Comment"
              value={markerComment}
              onChangeText={setMarkerComment}
            />
            <AppButton
              title={"Save Changes"}
              onPress={handleEditMarker}
              color="secondary"
            />
            {selectedMarker && (
              <AppButton
                title="Delete Marker"
                onPress={() => handleDeleteMarker(selectedMarker.id)}
                color="primary"
              />
            )}
            <AppButton title="Cancel" onPress={closeModal} color="dark" />
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
    flex: 1,
  },
  map: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
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

export default MarkerEditScreen;
