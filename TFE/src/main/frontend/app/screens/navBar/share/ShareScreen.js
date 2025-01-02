import React, { useState, useContext, useEffect } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  View,
  RefreshControl,
} from "react-native";
import ShareTrackForm from "../../../components/ShareTrackForm";
import Screen from "../../../components/Screen";
import ShareCard from "../../../components/ShareCard";
import TracksContext from "../../../hooks/tracksContext";
import useApi from "../../../hooks/useApi";
import tracksApi from "../../../api/tracks";
import useAuth from "../../../auth/useAuth";

import AppButton from "../../../components/Button";
import colors from "../../../config/colors";

function ShareScreen() {
  const { user } = useAuth();
  const { unsharedTracks, setUnsharedTracks, toggleShareStatus } =
    useContext(TracksContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [initialDetails, setInitialDetails] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const getTrackDetailsApi = useApi(tracksApi.getTrackDetails);
  const getUnsharedTracksApi = useApi(tracksApi.getUnsharedTracks);

  useEffect(() => {
    fetchUnsharedTracks();
  }, [user]);

  const fetchUnsharedTracks = async () => {
    if (user) {
      const userInfo = { email: user.sub };
      const response = await getUnsharedTracksApi.request(userInfo);
      if (response.ok) {
        const sortedTracks = response.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setUnsharedTracks(sortedTracks);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUnsharedTracks();
    setRefreshing(false);
  };

  const handleShare = async (track) => {
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
    fetchUnsharedTracks();
  };

  return (
    <Screen style={styles.screen}>
      <FlatList
        data={unsharedTracks}
        keyExtractor={(track) => track.id.toString()}
        renderItem={({ item }) => (
          <View>
            <ShareCard
              title={item.date}
              subTitle={
                "Duration: " +
                item.totalTime +
                "\n" +
                "Distance: " +
                item.distance.toFixed(3) +
                " km"
              }
              buttonTitle="Share"
              onShare={() => handleShare(item)}
            />
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
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
            buttonTitle={"Share"}
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

export default ShareScreen;
