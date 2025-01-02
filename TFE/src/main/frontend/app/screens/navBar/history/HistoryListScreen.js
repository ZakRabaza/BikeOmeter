import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import moment from "moment";
import Icon from "../../../components/Icon";
import ListItem from "../../../components/lists/ListItem";
import ListItemDeleteAction from "../../../components/lists/ListItemDeleteAction";
import ListItemSeparator from "../../../components/lists/ListItemSeparator";
import Screen from "../../../components/Screen";
import colors from "../../../config/colors";
import routes from "../../../navigation/routes";
import useApi from "../../../hooks/useApi";
import useAuth from "../../../auth/useAuth";
import tracksApi from "../../../api/tracks";

function HistoryListScreen({ navigation }) {
  const { user } = useAuth();
  const getOwnerTracksApi = useApi(tracksApi.getOwnerTracks);
  const deleteTrackApi = useApi(tracksApi.deleteTrack); // Add deleteTrack API hook
  const [refreshing, setRefreshing] = useState(false);

  const userInfo = {
    email: user.sub,
  };

  useEffect(() => {
    getOwnerTracksApi.request(userInfo);
  }, []);

  const handleDelete = async (track) => {
    const result = await deleteTrackApi.request(track.id);
    if (!result.ok) {
      console.log("Could not delete track.");
      return;
    }

    getOwnerTracksApi.request(userInfo); // Refresh the list after deletion
  };

  const formatDate = (date) => {
    return moment(date).format("DD-MM-YYYY HH:mm:ss"); // Format the date
  };

  const sortedTracks = [...getOwnerTracksApi.data].sort((a, b) => {
    return new Date(b.date) - new Date(a.date); // Sort tracks by date, most recent first
  });

  return (
    <Screen style={styles.screen}>
      <FlatList
        data={sortedTracks} // Use sorted tracks
        keyExtractor={(track) => track.id.toString()}
        renderItem={({ item }) => (
          <ListItem
            title={formatDate(item.date)} // Format the date here
            IconComponent={
              <Icon name="timer" size={40} backgroundColor={colors.secondary} />
            }
            subTitle={
              "Time: " +
              item.totalTime.toString() +
              "\n" +
              "Distance: " +
              item.distance.toFixed(3) +
              " km"
            }
            onPress={() => navigation.navigate(routes.TRACK_DETAILS, item)}
            renderRightActions={() => (
              <ListItemDeleteAction onPress={() => handleDelete(item)} />
            )}
          />
        )}
        ItemSeparatorComponent={ListItemSeparator}
        refreshing={refreshing}
        onRefresh={() => getOwnerTracksApi.request(userInfo)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 5,
    backgroundColor: colors.light,
  },
});

export default HistoryListScreen;
