import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  TextInput,
  Alert,
  Text,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../../config/colors";
import Screen from "../../../components/Screen";
import useApi from "../../../hooks/useApi";
import useAuth from "../../../auth/useAuth";
import commentsApi from "../../../api/comments";
import AppButton from "../../../components/Button";
import moment from "moment";

function CommentScreen({ route }) {
  const { user } = useAuth();
  const { track } = route.params;
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [comments, setComments] = useState([]);

  const getCommentsByTracksApi = useApi(commentsApi.getCommentsByTrackId);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const result = await getCommentsByTracksApi.request(track.id);
      if (result.ok) {
        const sortedComments = result.data.sort(
          (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
        );
        setComments(sortedComments);
      } else {
        Alert.alert("Error", "Failed to fetch comments.");
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const result = await commentsApi.addComment({
        content: newComment,
        trackId: track.id,
        authorEmail: user.sub,
      });

      if (result.ok) {
        setNewComment("");
        fetchComments();
      } else {
        Alert.alert("Error", "Failed to add comment.");
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const handleEditComment = async (comment) => {
    try {
      const result = await commentsApi.updateComment(comment);

      if (result.ok) {
        setEditingComment(null);
        fetchComments();
      } else {
        Alert.alert("Error", "Failed to edit comment.");
      }
    } catch (error) {
      console.error("Failed to edit comment:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const result = await commentsApi.deleteComment(commentId);

      if (result.ok) {
        fetchComments();
      } else {
        Alert.alert("Error", "Failed to delete comment.");
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format("DD-MM-YYYY HH:mm:ss");
  };

  return (
    <Screen style={styles.screen}>
      <FlatList
        data={comments}
        keyExtractor={(comment) => comment.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.commentContainer}>
            <Text style={styles.commentAuthor}>{item.authorEmail}</Text>
            <Text style={styles.commentDate}>
              {formatDate(item.createdDate)}
            </Text>
            {editingComment && editingComment.id === item.id ? (
              <>
                <TextInput
                  style={styles.commentInput}
                  value={editingComment.content}
                  onChangeText={(text) =>
                    setEditingComment({ ...editingComment, content: text })
                  }
                />
                <AppButton
                  title="Save"
                  onPress={() => handleEditComment(editingComment)}
                  color="secondary"
                />
                <AppButton
                  title="Cancel"
                  onPress={() => setEditingComment(null)}
                  color="dark"
                />
              </>
            ) : (
              <>
                <Text>{item.content}</Text>
                {item.authorEmail === user.sub && (
                  <View style={styles.commentActions}>
                    <MaterialCommunityIcons
                      name="comment-edit"
                      size={24}
                      color={colors.primary}
                      onPress={() => setEditingComment(item)}
                      style={styles.icon}
                    />
                    <MaterialCommunityIcons
                      name="delete-outline"
                      size={24}
                      color={colors.danger}
                      onPress={() =>
                        Alert.alert(
                          "Delete Comment",
                          "Are you sure you want to delete this comment?",
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "OK",
                              onPress: () => handleDeleteComment(item.id),
                            },
                          ]
                        )
                      }
                      style={styles.icon}
                    />
                  </View>
                )}
              </>
            )}
          </View>
        )}
      />

      <View style={styles.addCommentContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Add a comment"
          value={newComment}
          onChangeText={setNewComment}
        />
        <AppButton
          title="Post Comment"
          onPress={handleAddComment}
          color="secondary"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 10,
    backgroundColor: colors.light,
  },
  commentContainer: {
    backgroundColor: colors.white,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderRadius: 15,

    marginBottom: 5,

    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  commentAuthor: {
    fontWeight: "bold",
  },
  commentDate: {
    fontSize: 12,
    color: "#888",
    marginBottom: 5,
  },
  commentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  addCommentContainer: {
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 15,

    borderBottomWidth: 1,
    borderBottomColor: "#ccc",

    marginBottom: 5,

    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  icon: {
    marginLeft: 10,
  },
});

export default CommentScreen;
