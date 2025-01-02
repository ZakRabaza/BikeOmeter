import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import colors from "../../../config/colors";
import Text from "../../../components/Text";

import moment from "moment";

function TrackDetailsReadOnlyScreen({ route }) {
  const { track } = route.params;

  const sortedCoordinates =
    track?.trackMap?.polyCoordinates
      ?.sort((a, b) => a.timestamp - b.timestamp)
      .map((coord) => ({
        latitude: coord.latitude,
        longitude: coord.longitude,
      })) || [];

  const markers =
    track?.trackMap?.markers?.map((marker) => ({
      id: marker.id,
      key: marker.id.toString(),
      name: marker.name,
      comment: marker.comment,
      coordinate: {
        latitude: marker.latitude,
        longitude: marker.longitude,
      },
    })) || [];

  const formatDate = (date) => {
    return moment(date).format("DD-MM-YYYY HH:mm:ss");
  };

  return (
    <View style={styles.container}>
      {sortedCoordinates.length > 0 ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: sortedCoordinates[0].latitude,
            longitude: sortedCoordinates[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Polyline
            coordinates={sortedCoordinates}
            strokeWidth={4}
            strokeColor="black"
            strokeColors={[
              "#7F0000",
              "#00000000",
              "#B24112",
              "#E5845C",
              "#238C23",
              "#7F0000",
            ]}
          />
          {markers.map((marker) => (
            <Marker
              key={marker.key}
              coordinate={marker.coordinate}
              title={marker.name}
              description={marker.comment}
            />
          ))}
        </MapView>
      ) : (
        <Text>No Map Data Available</Text>
      )}

      <ScrollView style={styles.detailsContainer}>
        <View style={styles.dataContainer}>
          <Text style={styles.title}>{formatDate(track.date)}</Text>
          <Text style={styles.mainStat}>Total Time: {track.totalTime}</Text>
          <Text style={styles.mainStat}>
            Distance:{" "}
            {parseFloat(track.distance ? track.distance : 0).toFixed(3)} km
          </Text>
          <Text style={styles.mainStat}>
            Calories:{" "}
            {parseFloat(track.calories ? track.calories : 0).toFixed(3)} kcal
          </Text>
          <Text style={styles.mainStat}>
            Average Speed:{" "}
            {parseFloat(track.averageSpeed ? track.averageSpeed : 0).toFixed(3)}{" "}
            km/h
          </Text>
          <Text style={styles.mainStat}>
            Max Speed:{" "}
            {parseFloat(track.maxSpeed ? track.maxSpeed : 0).toFixed(3)} km/h
          </Text>
          <Text style={styles.sectionTitle}>Time</Text>
          <Text>Paused Time: {track.pauseTime}</Text>
          <Text>Total Time: {track.totalTime}</Text>
          <Text>Start Time: {track.startTime}</Text>
          <Text>Finish Time: {track.finishTime}</Text>
          <Text style={styles.sectionTitle}>Altitude</Text>
          <Text>
            Max Altitude:{" "}
            {parseFloat(track.maxAltitude ? track.maxAltitude : 0).toFixed(3)} m
          </Text>
          <Text>
            Min Altitude:{" "}
            {parseFloat(track.minAltitude ? track.minAltitude : 0).toFixed(3)} m
          </Text>
          <Text>
            Start Altitude:{" "}
            {parseFloat(track.startAltitude ? track.startAltitude : 0).toFixed(
              3
            )}{" "}
            m
          </Text>
          <Text>
            Finish Altitude:{" "}
            {parseFloat(
              track.finishAltitude ? track.finishAltitude : 0
            ).toFixed(3)}{" "}
            m
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dataContainer: {
    flex: 1,
    bottom: 15,
  },
  map: {
    flex: 1,
  },
  detailsContainer: {
    flex: 1,
    padding: 10,
    paddingBottom: 10,
  },
  mainStat: {
    alignSelf: "center",
    color: colors.secondary,
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 5,
  },
  title: {
    alignSelf: "center",
    color: colors.dark,
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  sectionTitle: {
    alignSelf: "center",
    color: colors.primary,
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 8,
  },
});

export default TrackDetailsReadOnlyScreen;
