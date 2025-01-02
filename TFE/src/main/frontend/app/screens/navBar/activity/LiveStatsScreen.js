import React, { useEffect, useState, useContext } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import colors from "../../../config/colors";
import Screen from "../../../components/Screen";
import Text from "../../../components/Text";

import { getDistance } from "geolib";

import LocationContext from "../../../hooks/locationContext";
import LocationsContext from "../../../hooks/locationsContext";
import StopWatchTimer from "../../../components/timer/StopWatchTimer";

const Item = ({ title, valueData, unit }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.separator} />
    <Text style={styles.valueData}>{valueData}</Text>
    <View style={styles.separator} />
    <Text style={styles.unit}>{unit}</Text>
  </View>
);

function LiveStatsScreen() {
  const [location, setLocation] = useContext(LocationContext);
  const [locations, setLocations] = useContext(LocationsContext);
  const [time, setTime] = useState(0);
  const [formatedTime, setFormatedTime] = useState("");

  const setTimeData = (newTime) => {
    setTime(newTime);
  };

  const calculateDistance = () => {
    let totalDistance = 0;

    for (let i = 0; i < locations.length - 1; i++) {
      const firstCoordinate = locations[i];
      const secondCoordinate = locations[i + 1];
      const dis = getDistance(
        {
          latitude: firstCoordinate.latitude,
          longitude: firstCoordinate.longitude,
        },
        {
          latitude: secondCoordinate.latitude,
          longitude: secondCoordinate.longitude,
        }
      );
      totalDistance += dis;
    }

    return (totalDistance / 1000).toFixed(3); // Convert meters to kilometers and round to 3 decimal places
  };

  const calculateAverageSpeed = () => {
    let timePassed = time; // seconds
    let distance = parseFloat(calculateDistance()) * 1000; // distance in meters
    // in m/s
    let avgSpd = distance / timePassed;
    // console.log(avgSpd);
    if (time === 0) {
      return 0;
    } else {
      return (avgSpd * 3.6).toFixed(3); // Convert m/s to km/h
    }
  };

  // Initial listing setup with proper value calculation
  const [listings, setListings] = useState([
    {
      id: 1,
      title: "Speed",
      valueData: parseFloat(location.speed ? location.speed * 3.6 : 0).toFixed(
        2
      ),
      unit: "km/h",
    },
    {
      id: 2,
      title: "Distance",
      valueData: calculateDistance(),
      unit: "km",
    },
    {
      id: 3,
      title: "Time",
      valueData: formatedTime,
      unit: "s",
    },
    {
      id: 4,
      title: "Average Speed",
      valueData: calculateAverageSpeed(),
      unit: "km/h",
    },
  ]);

  // Use useEffect to update "Speed" value whenever the location.speed changes
  useEffect(() => {
    setListings((prevListings) =>
      prevListings.map((item) =>
        item.title === "Speed"
          ? {
              ...item,
              valueData: parseFloat(
                location && location.speed ? location.speed * 3.6 : 0
              ).toFixed(2),
            }
          : item
      )
    );
  }, [location.speed]);

  // Use useEffect to update "Distance" value whenever locations change
  useEffect(() => {
    const updatedDistance = calculateDistance();
    setListings((prevListings) =>
      prevListings.map((item) =>
        item.title === "Distance"
          ? { ...item, valueData: updatedDistance }
          : item
      )
    );
  }, [locations]);

  // Use useEffect to update "Time" value whenever time changes
  useEffect(() => {
    setFormatedTime(new Date(time * 1000).toISOString().substring(11, 19));
  }, [time]);

  // Use useEffect to update the formatted time display
  useEffect(() => {
    setListings((prevListings) =>
      prevListings.map((item) =>
        item.title === "Time" ? { ...item, valueData: formatedTime } : item
      )
    );
  }, [formatedTime]);

  // Use useEffect to update "Average Speed" value whenever locations and time change
  useEffect(() => {
    const updatedAverageSpeed = calculateAverageSpeed();
    setListings((prevListings) =>
      prevListings.map((item) =>
        item.title === "Average Speed"
          ? { ...item, valueData: updatedAverageSpeed }
          : item
      )
    );
  }, [locations, time]);

  const renderItem = ({ item }) => (
    <Item title={item.title} valueData={item.valueData} unit={item.unit} />
  );

  return (
    <Screen style={styles.screen}>
      <FlatList
        style={styles.data}
        numColumns={2}
        data={listings}
        keyExtractor={(listing) => listing.id.toString()}
        renderItem={renderItem}
      />
      <StopWatchTimer setTimeData={setTimeData} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  data: {
    flex: 1,
  },
  screen: {
    padding: 3,
    paddingBottom: 0,
    backgroundColor: colors.light,
  },
  item: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 25,
    flexDirection: "column",
    flex: 0.5,
    justifyContent: "center",
    minHeight: 270,
    marginVertical: 3,
    marginHorizontal: 3,
    padding: 5,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
  },
  valueData: {
    color: colors.secondary,
    fontSize: 38,
    fontWeight: "bold",
  },
  unit: {
    fontSize: 25,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 15,
  },
});

export default LiveStatsScreen;
