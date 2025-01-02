import React, { createContext, useState, useEffect } from "react";
import useAuth from "../auth/useAuth";
import tracksApi from "../api/tracks";

const TracksContext = createContext();

export const TracksProvider = ({ children }) => {
  const { user } = useAuth();
  const [unsharedTracks, setUnsharedTracks] = useState([]);
  const [sharedTracks, setSharedTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTracks = async (userInfo) => {
    try {
      setLoading(true);
      setError(null);

      const unsharedResponse = await tracksApi.getUnsharedTracks(userInfo);
      const sharedResponse = await tracksApi.getSharedTracks(userInfo);

      if (unsharedResponse.ok) setUnsharedTracks(unsharedResponse.data);
      if (sharedResponse.ok) setSharedTracks(sharedResponse.data);
    } catch (error) {
      console.error("Failed to load tracks:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const userInfo = { email: user.sub };
      loadTracks(userInfo);
    }
  }, [user]);

  const toggleShareStatus = async (track) => {
    if (!user) {
      console.error("User is not defined. Cannot toggle share status.");
      return false;
    }

    const { id, bikeType, routeType, location, comment, shared } = track;

    const trackData = {
      shared,
      bikeType,
      routeType,
      location,
      comment,
    };

    const userInfo = { email: user.sub };

    try {
      const result = await tracksApi.updateTrackSharingStatus(id, trackData);

      if (!result.ok) {
        console.error("Failed to update the track status:", result);
        return false;
      }

      await loadTracks(userInfo);
      return true;
    } catch (error) {
      console.error("Failed to update the track status:", error);
      return false;
    }
  };

  return (
    <TracksContext.Provider
      value={{
        unsharedTracks,
        setUnsharedTracks,
        sharedTracks,
        setSharedTracks,
        toggleShareStatus,
        loading,
        error,
      }}
    >
      {children}
    </TracksContext.Provider>
  );
};

export default TracksContext;
