import React, { useState, useContext, useEffect } from "react";
import { FlatList, Modal, StyleSheet, View } from "react-native";
import Screen from "../../../components/Screen";
import TrackCard from "../../../components/TrackCard";
import TracksContext from "../../../hooks/tracksContext";
import ShareTrackForm from "../../../components/ShareTrackForm";
import colors from "../../../config/colors";
import AppButton from "../../../components/Button";
import useApi from "../../../hooks/useApi";
import tracksApi from "../../../api/tracks";
import routes from "../../../navigation/routes";

function SharedScreen({ navigation }) {
  const { sharedTracks, toggleShareStatus } = useContext(TracksContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [initialDetails, setInitialDetails] = useState({});
  const getTrackDetailsApi = useApi(tracksApi.getTrackDetails);

  const sortedTracks = sharedTracks.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const handleEdit = async (track) => {
    setSelectedTrack(track);
    const result = await getTrackDetailsApi.request(track.id);

    if (result.ok) {
      setInitialDetails(result.data);
    } else {
      setInitialDetails({});
    }
    setModalVisible(true);
  };

  const handleSubmit = async (details) => {
    await toggleShareStatus({ ...selectedTrack, ...details, shared: true });
    setModalVisible(false);
  };

  const handleCardPress = (track) => {
    navigation.navigate(routes.COMMENT, { track });
  };

  return (
    <Screen style={styles.screen}>
      <FlatList
        data={sortedTracks}
        keyExtractor={(track) => track.id.toString()}
        renderItem={({ item }) => (
          <View>
            <TrackCard
              title={item.date}
              subTitle={
                "Duration: " +
                item.totalTime +
                "\n" +
                "Distance: " +
                item.distance.toFixed(3) +
                " km"
              }
              firstButtonTitle={"Unshare"}
              secondButtonTitle={"Edit"}
              onFirstButtonPress={() =>
                toggleShareStatus({ ...item, shared: false })
              }
              onSecondButtonPress={() => handleEdit(item)}
              onPress={() => handleCardPress(item)}
              details={{
                bikeType: item.bikeType,
                routeType: item.routeType,
                location: item.location,
                comment: item.comment,
              }}
            />
          </View>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalView}>
          <ShareTrackForm
            onSubmit={handleSubmit}
            initialValues={initialDetails}
            buttonTitle={"Update"}
          />
          <AppButton
            title="Cancel"
            onPress={() => setModalVisible(false)}
            color="dark"
          />
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 5,
    backgroundColor: colors.light,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default SharedScreen;
