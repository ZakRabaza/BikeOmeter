import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import AccountScreen from "../screens/navBar/AccountScreen";

const Stack = createStackNavigator();

const AccountNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AccountDetails"
      component={AccountScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default AccountNavigator;
