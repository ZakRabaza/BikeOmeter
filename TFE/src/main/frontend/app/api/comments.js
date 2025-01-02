import client from "./client";

const endpoint = "/v1/comments";

const getComments = () => client.get(endpoint);
const getComment = (commentId) => client.get(`${endpoint}/${commentId}`);
const getCommentsByTrackId = (trackId) =>
  client.get(`${endpoint}/track/${trackId}`);
const addComment = (comment) => client.post(endpoint, comment);
const updateComment = (comment) => client.put(endpoint, comment);

const deleteComment = (commentId) => client.delete(`${endpoint}/${commentId}`);

export default {
  getComments,
  getComment,
  getCommentsByTrackId,
  addComment,
  updateComment,
  deleteComment,
};
