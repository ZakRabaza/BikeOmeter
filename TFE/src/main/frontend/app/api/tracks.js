import client from "./client";

const endpoint = "/v1/tracks";

const getTracks = () => client.get(endpoint);

const getOwnerTracks = (userInfo) => client.post(`${endpoint}/owner`, userInfo);

const getUnsharedTracks = (userInfo) =>
  client.post(`${endpoint}/unshared/user`, userInfo);

const getSharedTracks = (userInfo) =>
  client.post(`${endpoint}/shared/user`, userInfo);

const getSharedTracksExcludingUser = (userInfo) =>
  client.post(`${endpoint}/shared/others`, userInfo);

const addTrack = (trackData) => client.post(endpoint, trackData);

const addLocations = (locationsData) =>
  client.post(`${endpoint}/location`, locationsData);

const deleteTrack = (trackId) => client.delete(`${endpoint}/${trackId}`);

const updateTrackSharingStatus = (trackId, sharedData) =>
  client.put(`${endpoint}/${trackId}/share`, sharedData);

const getTrackDetails = (trackId) => client.get(`${endpoint}/${trackId}`);

export default {
  addTrack,
  deleteTrack,
  addLocations,
  getTracks,
  getOwnerTracks,
  getUnsharedTracks,
  getSharedTracks,
  getSharedTracksExcludingUser,
  updateTrackSharingStatus,
  getTrackDetails,
};
