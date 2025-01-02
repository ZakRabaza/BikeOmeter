import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";

import Speedometer, {
  Background,
  Arc,
  Needle,
  Progress,
  Marks,
  Indicator,
} from "react-native-cool-speedometer";

import colors from "../../../config/colors";
import Screen from "../../../components/Screen";

import AppLocation from "../../../components/location/AppLocation";
import AddTrack from "../../../components/track/AddTrack";

import LocationContext from "../../../hooks/locationContext";
import StartStopContext from "../../../hooks/startStopContext";

function DisplayScreen() {
  const [location, setLocation] = useContext(LocationContext);
  const [elementVisible] = useContext(StartStopContext);

  return (
    <>
      <Screen style={styles.screen}>
        <>
          <View style={styles.container}>
            <Speedometer
              value={location.speed ? location.speed * 3.6 : 0}
              fontFamily="squada-one"
              min={0}
              max={90}
              angle={200}
              accentColor={colors.primary}
              width={300}
            >
              <Background color={colors.dark} />
              <Arc />
              <Needle />
              <Progress />
              <Marks />
              <Indicator />
            </Speedometer>
          </View>
        </>
        <>
          <AppLocation></AppLocation>
          {!elementVisible ? <AddTrack></AddTrack> : null}
        </>
      </Screen>
    </>
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
    alignItems: "center",
  },
});

export default DisplayScreen;
