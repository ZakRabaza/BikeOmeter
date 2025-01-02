import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Button,
  TouchableWithoutFeedback,
} from "react-native";

import Text from "./Text";
import colors from "../config/colors";

function TrackCard({
  title,
  subTitle,
  image,
  firstButtonTitle,
  secondButtonTitle,
  onFirstButtonPress,
  onSecondButtonPress,
  details,
  onPress,
}) {
  function formatDate(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `Date : ${day}-${month}-${year} Start: ${hours}:${minutes}:${seconds}`;
  }

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.card}>
        {image && <Image style={styles.image} source={image} />}
        <View style={styles.detailsContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {formatDate(title)}
          </Text>
          <Text style={styles.subTitle} numberOfLines={2}>
            {subTitle}
          </Text>
          {details && (
            <>
              <Text>{`Type de vélo: ${details.bikeType || "VTT"}`}</Text>
              <Text>{`Type de parcours: ${details.routeType || "Ville"}`}</Text>
              <Text>{`Lieu: ${details.location || "N/A"}`}</Text>
              <Text>{`Commentaire: ${details.comment || "N/A"}`}</Text>
            </>
          )}
          <View style={styles.buttonContainer}>
            <Button
              title={firstButtonTitle}
              onPress={onFirstButtonPress}
              color={colors.primary}
            />
            <Button
              title={secondButtonTitle}
              onPress={onSecondButtonPress}
              color={colors.secondary}
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    backgroundColor: colors.white,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3, // For Android shadow
  },
  detailsContainer: {
    padding: 20,
  },
  image: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  subTitle: {
    color: colors.secondary,
    fontWeight: "bold",
    marginBottom: 10,
  },
  title: {
    marginBottom: 7,
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default TrackCard;
