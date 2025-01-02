import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import HistoryListScreen from "../screens/navBar/history/HistoryListScreen";
import TrackDetailsScreen from "../screens/navBar/history/TrackDetailsScreen";
import MarkerEditScreen from "../screens/navBar/history/MarkerEditScreen";

const Stack = createStackNavigator();

const HistoryNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HistoryList"
      component={HistoryListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="TrackDetails"
      component={TrackDetailsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="MarkerEditScreen"
      component={MarkerEditScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default HistoryNavigator;
