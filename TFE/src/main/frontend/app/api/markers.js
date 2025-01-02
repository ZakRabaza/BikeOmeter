import client from "./client";

const endpoint = "/v1/markers";

const getMarkers = () => client.get(endpoint);
const getMarkersByTrackMapId = (trackMapId) =>
  client.get(`${endpoint}/trackMap/${trackMapId}`);
const addMarker = (marker) => client.post(endpoint, marker);
const updateMarker = (marker) => client.put(endpoint, marker);
const deleteMarker = (markerId) => client.delete(`${endpoint}/${markerId}`);

export default {
  getMarkers,
  getMarkersByTrackMapId,
  addMarker,
  updateMarker,
  deleteMarker,
};
