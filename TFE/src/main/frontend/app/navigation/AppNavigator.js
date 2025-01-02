import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import StatisticsScreen from "../screens/navBar/StatisticsScreen";
import HistoryNavigator from "./HistoryNavigator";
import ActivityNavigator from "./ActivityNavigator";
import ShareNavigator from "./ShareNavigator";
import AccountNavigator from "./AccountNavigator";

const Tab = createBottomTabNavigator();

const AppNavigator = () => (
  <Tab.Navigator initialRouteName="Activity">
    <Tab.Screen
      name="Statistics"
      component={StatisticsScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name="chart-areaspline"
            color={color}
            size={size}
          />
        ),
        headerStyle: { height: 90 },
      }}
    />
    <Tab.Screen
      name="History"
      component={HistoryNavigator}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="history" color={color} size={size} />
        ),
        headerStyle: { height: 90 },
      }}
    />
    <Tab.Screen
      name="Activity"
      component={ActivityNavigator}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="bike" color={color} size={size} />
        ),
        headerStyle: { height: 90 },
      }}
    />
    <Tab.Screen
      name="Share"
      component={ShareNavigator}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="share" color={color} size={size} />
        ),
        headerStyle: { height: 90 },
      }}
    />
    <Tab.Screen
      name="Account"
      component={AccountNavigator}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="account" color={color} size={size} />
        ),
        headerStyle: { height: 90 },
      }}
    />
  </Tab.Navigator>
);

export default AppNavigator;
