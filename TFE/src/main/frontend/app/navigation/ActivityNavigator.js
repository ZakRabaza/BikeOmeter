import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import LiveStatsScreen from "../screens/navBar/activity/LiveStatsScreen";
import DisplayScreen from "../screens/navBar/activity/DisplayScreen";
import MapScreen from "../screens/navBar/activity/MapScreen";

const Tab = createMaterialTopTabNavigator();

const ActivityNavigator = () => (
  <Tab.Navigator initialRouteName="Activity">
    <Tab.Screen name="DISPLAY" component={DisplayScreen} />
    <Tab.Screen name="LIVE STATS" component={LiveStatsScreen} />
    <Tab.Screen name="MAP" component={MapScreen} />
  </Tab.Navigator>
);

export default ActivityNavigator;
