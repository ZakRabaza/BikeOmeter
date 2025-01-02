import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
  RefreshControl,
} from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import colors from "../../config/colors";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Screen from "../../components/Screen";
import AppText from "../../components/Text";
import AppButton from "../../components/Button";
import useApi from "../../hooks/useApi";
import useAuth from "../../auth/useAuth";
import tracksApi from "../../api/tracks";

function timestrToSec(timestr) {
  const parts = timestr.split(":");
  return (
    parseInt(parts[0], 10) * 3600 +
    parseInt(parts[1], 10) * 60 +
    parseInt(parts[2], 10)
  );
}

function pad(num) {
  return num < 10 ? `0${num}` : num.toString();
}

function formatTime(seconds) {
  return [
    pad(Math.floor(seconds / 3600)),
    pad(Math.floor((seconds % 3600) / 60)),
    pad(seconds % 60),
  ].join(":");
}

function StatisticsScreen() {
  const { user } = useAuth();
  const getOwnerTracksApi = useApi(tracksApi.getOwnerTracks);

  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [filteredTracks, setFilteredTracks] = useState([]);

  const fetchOwnerTracks = () => {
    const userInfo = { email: user.sub };
    getOwnerTracksApi.request(userInfo);
  };

  useEffect(() => {
    fetchOwnerTracks();
  }, [user]);

  // Function to filter tracks based on date range
  const filterTracksByDate = () => {
    const filtered = getOwnerTracksApi.data.filter((track) => {
      const trackDate = new Date(track.date);
      return trackDate >= dateFrom && trackDate <= dateTo;
    });
    setFilteredTracks(filtered);
  };

  // Update filtered tracks when data changes
  useEffect(() => {
    if (getOwnerTracksApi.data) {
      filterTracksByDate();
    }
  }, [getOwnerTracksApi.data, dateFrom, dateTo]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOwnerTracks();
    setRefreshing(false);
  };

  const onChangeFrom = (event, selectedDate) => {
    const currentDate = selectedDate || dateFrom;
    setDateFrom(currentDate);
  };

  const showDatepickerFrom = () => {
    DateTimePickerAndroid.open({
      display: "default",
      value: dateFrom,
      onChange: onChangeFrom,
      mode: "date",
      is24Hour: true,
    });
  };

  const onChangeto = (event, selectedDate) => {
    const currentDate = selectedDate || dateTo;
    setDateTo(currentDate);
  };

  const showDatepickerTo = () => {
    DateTimePickerAndroid.open({
      display: "default",
      value: dateTo,
      onChange: onChangeto,
      mode: "date",
      is24Hour: true,
    });
  };

  // Statistics calculations based on filtered tracks
  const sumTracks = filteredTracks.length;
  const sumDistance = filteredTracks.reduce(
    (acc, track) => acc + track.distance,
    0
  );
  const totalTravelTime = formatTime(
    filteredTracks.reduce(
      (acc, track) => acc + timestrToSec(track.activeTime),
      0
    )
  );
  const totalTime = formatTime(
    filteredTracks.reduce(
      (acc, track) => acc + timestrToSec(track.totalTime),
      0
    )
  );
  const calories = filteredTracks.reduce(
    (acc, track) => acc + track.calories,
    0
  );

  const tracksData = [
    { id: 1, title: "Track Number", subTitle: sumTracks },
    { id: 2, title: "Total Travel Time", subTitle: totalTravelTime },
    { id: 3, title: "Total Time", subTitle: totalTime },
    {
      id: 4,
      title: "Distance",
      subTitle: `${parseFloat(sumDistance.toFixed(2))} km`,
    },
    { id: 5, title: "Calories", subTitle: `${calories.toFixed(0)} kcal` },
  ];

  return (
    <Screen style={styles.screen}>
      {getOwnerTracksApi.loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : getOwnerTracksApi.error ? (
        <View>
          <AppText>Couldn't retrieve the tracks.</AppText>
          <AppButton title="Retry" onPress={fetchOwnerTracks} />
        </View>
      ) : (
        <>
          <View style={styles.datePicker}>
            <Button
              onPress={showDatepickerFrom}
              title={`From : ${dateFrom.toDateString()}`}
              color="medium"
            />
            <Button
              onPress={showDatepickerTo}
              title={`To : ${dateTo.toDateString()}`}
              color="dark"
            />
          </View>
          <View style={styles.dataContainer}>
            <FlatList
              data={tracksData}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Card title={item.title} subTitle={item.subTitle} />
              )}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 5,
    backgroundColor: colors.light,
  },
  dataContainer: {
    flex: 3,
  },
  datePicker: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignContent: "flex-start",
  },
});

export default StatisticsScreen;
