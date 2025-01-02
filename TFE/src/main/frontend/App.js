import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";

import "react-native-gesture-handler";

import navigationTheme from "./app/navigation/navigationTheme";
import AppNavigator from "./app/navigation/AppNavigator";
import AuthNavigator from "./app/navigation/AuthNavigator";
import authStorage from "./app/auth/storage";

import AuthContext from "./app/auth/authContext";

import { TracksProvider } from "./app/hooks/tracksContext";

import StartStopContext from "./app/hooks/startStopContext";
import PauseContext from "./app/hooks/pauseContext";

import LocationContext from "./app/hooks/locationContext";
import LocationsContext from "./app/hooks/locationsContext";
import MarkersContext from "./app/hooks/markersContext";

import StartTimeContext from "./app/hooks/startTimeContext";
import StopTimeContext from "./app/hooks/stopTimeContext";
import PauseTimeContext from "./app/hooks/pauseTimeContext";

export default function App() {
  const [user, setUser] = useState();

  const [startStopStatus, setStartStopStatus] = useState(false);
  const [pauseStatus, setPauseStatus] = useState(false);
  const [location, setLocation] = useState(0);
  const [locations, setLocations] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [startTime, setStartTime] = useState(0);
  const [stopTime, setStopTime] = useState(0);
  const [pauseTime, setPauseTime] = useState(0);

  const restoreUser = async () => {
    const user = await authStorage.getUser();
    if (user) setUser(user);
  };

  useEffect(() => {
    restoreUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <TracksProvider>
        <StartStopContext.Provider
          value={[startStopStatus, setStartStopStatus]}
        >
          <PauseContext.Provider value={[pauseStatus, setPauseStatus]}>
            <StartTimeContext.Provider value={[startTime, setStartTime]}>
              <StopTimeContext.Provider value={[stopTime, setStopTime]}>
                <PauseTimeContext.Provider value={[pauseTime, setPauseTime]}>
                  <MarkersContext.Provider value={[markers, setMarkers]}>
                    <LocationsContext.Provider
                      value={[locations, setLocations]}
                    >
                      <LocationContext.Provider value={[location, setLocation]}>
                        <NavigationContainer theme={navigationTheme}>
                          {user ? <AppNavigator /> : <AuthNavigator />}
                        </NavigationContainer>
                      </LocationContext.Provider>
                    </LocationsContext.Provider>
                  </MarkersContext.Provider>
                </PauseTimeContext.Provider>
              </StopTimeContext.Provider>
            </StartTimeContext.Provider>
          </PauseContext.Provider>
        </StartStopContext.Provider>
      </TracksProvider>
    </AuthContext.Provider>
  );
}
