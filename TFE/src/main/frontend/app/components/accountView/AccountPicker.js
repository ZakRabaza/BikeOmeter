import React from "react";
import { Alert, View, TouchableOpacity, Modal, StyleSheet } from "react-native";

import Text from "../Text";
import colors from "../../config/colors";

import { PickerType } from "./PickerType";
import AgePicker from "./AgePicker";
import GenderPicker from "./GenderPicker";
import HeightPicker from "./HeightPicker";
import WeightPicker from "./WeightPicker";

function AccountPicker({
  modalOpen,
  setModalOpen,
  type,
  userObject,
  onUpdateUser,
}) {
  return (
    <View>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalOpen}
        onRequestClose={() =>
          Alert.alert(
            "Selection canceled",
            "Your choice will not be registered.",
            [{ text: "Ok", onPress: () => setModalOpen({ show: false }) }]
          )
        }
      >
        <View style={styles.container}>
          <View style={styles.pickerContainer}>
            {type === PickerType.AGE && userObject && (
              <AgePicker
                setModalOpen={setModalOpen}
                userObject={userObject}
                onUpdateUser={onUpdateUser}
              />
            )}
            {type === PickerType.GENDER && userObject && (
              <GenderPicker
                setModalOpen={setModalOpen}
                userObject={userObject}
                onUpdateUser={onUpdateUser}
              />
            )}
            {type === PickerType.HEIGHT && userObject && (
              <HeightPicker
                setModalOpen={setModalOpen}
                userObject={userObject}
                onUpdateUser={onUpdateUser}
              />
            )}
            {type === PickerType.WEIGHT && userObject && (
              <WeightPicker
                setModalOpen={setModalOpen}
                userObject={userObject}
                onUpdateUser={onUpdateUser}
              />
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalOpen({ show: false })}
            >
              <Text> Close </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    borderTopLeftRadius: 25,
    borderTopEndRadius: 25,
    flex: 1,
    justifyContent: "center",
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderRadius: 25,
    paddingBottom: 25,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 15,
  },
  closeButton: {
    alignSelf: "flex-end",
    backgroundColor: colors.danger,
    borderRadius: 25,
    padding: 15,
  },
});

export default AccountPicker;
