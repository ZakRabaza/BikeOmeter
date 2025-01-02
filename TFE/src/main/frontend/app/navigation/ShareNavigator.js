import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import ShareScreen from "../screens/navBar/share/ShareScreen";
import SharedScreen from "../screens/navBar/share/SharedScreen";
import BrowseScreen from "../screens/navBar/share/BrowseScreen";
import TrackDetailsReadOnlyScreen from "../screens/navBar/share/TrackDetailsReadOnlyScreen";
import CommentScreen from "../screens/navBar/share/CommentScreen";

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

const ShareTabs = () => (
  <Tab.Navigator initialRouteName="Share">
    <Tab.Screen name="NOT SHARED" component={ShareScreen} />
    <Tab.Screen name="SHARED" component={SharedScreen} />
    <Tab.Screen name="BROWSE" component={BrowseScreen} />
  </Tab.Navigator>
);

const ShareNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ShareTabs"
      component={ShareTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="TrackDetailsReadOnly"
      component={TrackDetailsReadOnlyScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Comment"
      component={CommentScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default ShareNavigator;
