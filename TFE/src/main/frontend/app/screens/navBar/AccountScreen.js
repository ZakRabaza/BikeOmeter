import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import Icon from "../../components/Icon";
import { ListItem, ListItemSeparator } from "../../components/lists";
import Screen from "../../components/Screen";
import colors from "../../config/colors";
import useApi from "../../hooks/useApi";
import useAuth from "../../auth/useAuth";
import usersApi from "../../api/users";
import AccountPicker from "../../components/accountView/AccountPicker";
import { PickerType } from "../../components/accountView/PickerType";

const userInfoCategory = [
  {
    title: "Age",
    icon: {
      name: "calendar-star",
      backgroundColor: colors.primary,
    },
    targetScreen: PickerType.AGE,
  },
  {
    title: "Gender",
    icon: {
      name: "gender-male-female",
      backgroundColor: colors.primary,
    },
    targetScreen: PickerType.GENDER,
  },
  {
    title: "Height",
    icon: {
      name: "human-male-height",
      backgroundColor: colors.secondary,
    },
    targetScreen: PickerType.HEIGHT,
  },
  {
    title: "Weight",
    icon: {
      name: "weight",
      backgroundColor: colors.secondary,
    },
    targetScreen: PickerType.WEIGHT,
  },
];

function findLoggedUser(users, loggedUser) {
  return users.find((user) => user.email === loggedUser.sub);
}

function AccountScreen({ navigation }) {
  const { user, logOut } = useAuth();
  const [modal, setModal] = useState({ show: false });
  const getUsersApi = useApi(usersApi.getUsers);

  useEffect(() => {
    fetchUserData();
  }, []);

  // Function to fetch user data
  const fetchUserData = async () => {
    await getUsersApi.request();
  };

  const loggedUserInfo = findLoggedUser(getUsersApi.data, user);

  return (
    <Screen style={styles.screen}>
      <View style={styles.container}>
        <ListItem
          subTitle={user.sub}
          image={require("../../assets/user.png")}
        />
      </View>
      <View style={styles.container}>
        <FlatList
          data={userInfoCategory}
          keyExtractor={(userInfo) => userInfo.title}
          ItemSeparatorComponent={ListItemSeparator}
          renderItem={({ item }) => (
            <ListItem
              title={item.title}
              IconComponent={
                <Icon
                  name={item.icon.name}
                  backgroundColor={item.icon.backgroundColor}
                />
              }
              onPress={() =>
                setModal({
                  show: true,
                  type: item.targetScreen,
                })
              }
            />
          )}
        />
      </View>
      <View style={styles.container}>
        <ListItem
          title="Log Out"
          IconComponent={<Icon name="logout" backgroundColor="#ffe66d" />}
          onPress={() => logOut()}
        />
      </View>
      <AccountPicker
        modalOpen={modal.show}
        setModalOpen={setModal}
        type={modal.type}
        userObject={loggedUserInfo}
        onUpdateUser={fetchUserData}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  screen: {
    backgroundColor: colors.light,
  },
});

export default AccountScreen;
