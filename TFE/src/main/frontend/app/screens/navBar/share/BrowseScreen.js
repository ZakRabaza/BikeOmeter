import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import colors from "../../../config/colors";
import Screen from "../../../components/Screen";
import useApi from "../../../hooks/useApi";
import useAuth from "../../../auth/useAuth";
import tracksApi from "../../../api/tracks";
import TrackCard from "../../../components/TrackCard";
import routes from "../../../navigation/routes";
import AppButton from "../../../components/Button";

function BrowseScreen({ navigation }) {
  const { user } = useAuth();
  const getSharedTracksExcludingUserApi = useApi(
    tracksApi.getSharedTracksExcludingUser
  );

  const [bikeTypeFilter, setBikeTypeFilter] = useState("");
  const [routeTypeFilter, setRouteTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const userInfo = {
    email: user.sub,
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    bikeTypeFilter,
    routeTypeFilter,
    locationFilter,
    getSharedTracksExcludingUserApi.data,
  ]);

  const fetchTracks = async () => {
    setRefreshing(true);
    await getSharedTracksExcludingUserApi.request(userInfo);
    setRefreshing(false);
  };

  const applyFilters = () => {
    let tracks = getSharedTracksExcludingUserApi.data;

    if (bikeTypeFilter) {
      tracks = tracks.filter((track) => track.bikeType === bikeTypeFilter);
    }
    if (routeTypeFilter) {
      tracks = tracks.filter((track) => track.routeType === routeTypeFilter);
    }
    if (locationFilter) {
      tracks = tracks.filter((track) =>
        track.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Sort by date, newest first
    tracks = tracks.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredTracks(tracks);
  };

  const resetFilters = () => {
    setBikeTypeFilter("");
    setRouteTypeFilter("");
    setLocationFilter("");
  };

  const handleTrackDetailsPress = (track) => {
    navigation.navigate(routes.TRACK_DETAILS_READ_ONLY, { track });
  };

  const handleCommentPress = (track) => {
    navigation.navigate(routes.COMMENT, { track });
  };

  return (
    <Screen style={styles.screen}>
      {!showFilters && (
        <View style={styles.filterButtonContainer}>
          <AppButton
            title="Show Filters"
            onPress={() => setShowFilters(true)}
            color={"primary"}
          />
        </View>
      )}

      {/* Filter Controls */}
      {showFilters && (
        <View style={styles.filterContainer}>
          <Picker
            selectedValue={bikeTypeFilter}
            style={styles.picker}
            onValueChange={(itemValue) => setBikeTypeFilter(itemValue)}
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
            selectedValue={routeTypeFilter}
            style={styles.picker}
            onValueChange={(itemValue) => setRouteTypeFilter(itemValue)}
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
            style={styles.textInput}
            placeholder="Filter by Location"
            value={locationFilter}
            onChangeText={(text) => setLocationFilter(text)}
          />

          <AppButton
            title="Reset Filters"
            onPress={resetFilters}
            color={"primary"}
          />

          <AppButton
            title="Hide Filters"
            onPress={() => setShowFilters(false)}
            color={"secondary"}
          />
        </View>
      )}

      {/* Filtered Track List */}
      <FlatList
        data={filteredTracks}
        keyExtractor={(track) => track.id.toString()}
        renderItem={({ item }) => (
          <View>
            <TrackCard
              title={item.date}
              subTitle={
                "Duration: " +
                item.totalTime +
                "\n" +
                "Distance: " +
                item.distance.toFixed(3) +
                " km"
              }
              firstButtonTitle="Details"
              secondButtonTitle="Comment"
              onFirstButtonPress={() => handleTrackDetailsPress(item)}
              onSecondButtonPress={() => handleCommentPress(item)}
              details={{
                bikeType: item.bikeType,
                routeType: item.routeType,
                location: item.location,
                comment: item.comment,
              }}
            />
          </View>
        )}
        refreshing={refreshing}
        onRefresh={fetchTracks}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 5,
    backgroundColor: colors.light,
  },
  filterButtonContainer: {
    padding: 5,
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "column",
    justifyContent: "flex-start",
    padding: 10,
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 10,
  },
  textInput: {
    height: 50,
    width: "100%",
    borderColor: colors.dark,
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
});

export default BrowseScreen;
