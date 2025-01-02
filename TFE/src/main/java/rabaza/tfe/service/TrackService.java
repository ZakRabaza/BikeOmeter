package rabaza.tfe.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rabaza.tfe.dto.*;
import rabaza.tfe.mapper.TrackMapper;
import rabaza.tfe.model.*;
import rabaza.tfe.repository.TrackRepository;
import rabaza.tfe.repository.UserRepository;
import rabaza.tfe.utils.TrackCreator;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class TrackService {

    private final TrackRepository trackRepository;
    private final UserRepository userRepository;
    private final TrackCreator trackCreator;

    @Autowired
    public TrackService(TrackRepository trackRepository, UserRepository userRepository, TrackCreator trackCreator) {
        this.trackRepository = trackRepository;
        this.userRepository = userRepository;
        this.trackCreator = trackCreator;
    }

    public List<TrackInfo> getTracks() {
        return TrackMapper.INSTANCE.tracksToTracksInfo(trackRepository.findAll());
    }

    public TrackInfo getTrackById(Integer trackId) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new IllegalStateException("track with id " + trackId + " does not exist"));
        return TrackMapper.INSTANCE.trackToTrackInfo(track);
    }

    public List<TrackInfo> getUserUnsharedTracks(UserInfo userInfo) {
        Optional<User> owner = userRepository.findUserByEmail(userInfo.getEmail());
        if (owner.isEmpty()) {
            throw new IllegalStateException("User with this email does not exist");
        }
        List<Track> userUnsharedTracks = trackRepository.findByOwnerAndSharedFalse(owner.get());
        return TrackMapper.INSTANCE.tracksToTracksInfo(userUnsharedTracks);
    }

    public List<TrackInfo> getUserSharedTracks(UserInfo userInfo) {
        Optional<User> owner = userRepository.findUserByEmail(userInfo.getEmail());
        if (owner.isEmpty()) {
            throw new IllegalStateException("User with this email does not exist");
        }
        List<Track> userSharedTracks = trackRepository.findByOwnerAndSharedTrue(owner.get());
        return TrackMapper.INSTANCE.tracksToTracksInfo(userSharedTracks);
    }

    public List<TrackInfo> getSharedTracksExcludingUser(UserInfo userInfo) {
        Optional<User> owner = userRepository.findUserByEmail(userInfo.getEmail());
        if (owner.isEmpty()) {
            throw new IllegalStateException("User with this email does not exist");
        }
        List<Track> sharedTracks = trackRepository.findByOwnerNotAndSharedTrue(owner.get());
        return TrackMapper.INSTANCE.tracksToTracksInfo(sharedTracks);
    }

    public List<TrackInfo> getUserTracks(UserInfo userInfo) {
        Optional<User> owner = userRepository.findUserByEmail(userInfo.getEmail());
        if (owner.isEmpty()) {
            throw new IllegalStateException("user with this email does not exist");
        }
        return owner.get().getTracks().stream()
                .map(TrackMapper.INSTANCE::trackToTrackInfo).toList();
    }

    public void addNewTrack(Track track) {
        trackRepository.save(track);
    }

    public void deleteTrack(Integer trackId) {
        if (!trackRepository.existsById(trackId)) {
            throw new IllegalStateException("track with id " + trackId + " does not exist");
        }
        trackRepository.deleteById(trackId);
    }

    public void addNewTrackFromLocation(LocationsRequest locationsRequest) {
        Optional<User> owner = userRepository.findUserByEmail(locationsRequest.getUserEmail());
        if (owner.isEmpty()) {
            throw new IllegalStateException("User with email " + locationsRequest.getUserEmail() + " does not exist");
        }

        // Extract coordinates from location requests and create Coordinate objects
        Set<Coordinate> coordinateSet = getCoordinates(locationsRequest.getLocationRequests());

        // Extract markers from locationsRequest and create Marker objects
        Set<Marker> markerSet = getMarkers(locationsRequest.getMarkerInfos());

        // Create TrackMap object and set the set of coordinates
        TrackMap trackMap = new TrackMap();
        trackMap.setPolyCoordinates(coordinateSet);
        trackMap.setMarkers(markerSet);

        // Calculate total distance and conversion to time
        double totalDistance = trackCreator.calculateDistance(locationsRequest.getLocationRequests());
        LocalDateTime trackDate = trackCreator.convertToLocalDateTimeViaInstant(locationsRequest.getStartTime());
        LocalTime startTime = trackCreator.convertToLocalTimeViaInstant(locationsRequest.getStartTime());
        LocalTime stopTime = trackCreator.convertToLocalTimeViaInstant(locationsRequest.getStopTime());
        LocalTime totalTime = trackCreator.timeBetween(startTime, stopTime);

        // Convert pause time from seconds to Duration
        Duration pauseDuration = Duration.ofSeconds(locationsRequest.getPauseTime());
        LocalTime activeTime = totalTime.minus(pauseDuration);

        // Recovery of altitude data
        double startAltitude = locationsRequest.getLocationRequests().get(0).getAltitude();
        double finishedAltitude = locationsRequest.getLocationRequests().get(locationsRequest.getLocationRequests().size() - 1).getAltitude();

        // Recovery of speed data
        // Calculate average speed
        Duration activeDuration = Duration.between(startTime, stopTime).minus(pauseDuration);
        // Convert seconds to hours
        double averageSpeed = (totalDistance / activeDuration.toSeconds()) * 3600;

        // Calculate calories
        double calories = trackCreator.calculateCalories(averageSpeed, activeTime, owner.get());

        Track track = Track.builder()
                .date(trackDate)
                .totalTime(totalTime)
                .distance(totalDistance)
                .calories(calories)
                .averageSpeed(averageSpeed)
                .maxSpeed(getMaxSpeed(locationsRequest.getLocationRequests()))
                .pauseTime(LocalTime.ofSecondOfDay(pauseDuration.getSeconds()))
                .activeTime(activeTime)
                .startTime(startTime)
                .finishTime(stopTime)
                .maxAltitude(getMaxAltitude(locationsRequest.getLocationRequests()))
                .minAltitude(getMinAltitude(locationsRequest.getLocationRequests()))
                .startAltitude(startAltitude)
                .finishAltitude(finishedAltitude)
                .owner(owner.get())
                .shared(false)
                .trackMap(trackMap)
                .build();

        // Associate TrackMap with Track
        trackMap.setTrack(track);

        // Associate Coordinates with TrackMap
        for (Coordinate coordinate : coordinateSet) {
            coordinate.setTrackMap(trackMap);
        }

        // Associate Markers with TrackMap
        for (Marker marker : markerSet) {
            marker.setTrackMap(trackMap);
        }

        // Save the track with the TrackMap
        addNewTrack(track);
    }

    private double getMaxSpeed(List<LocationRequest> locationRequestList) {
        return locationRequestList.stream()
                .mapToDouble(LocationRequest::getSpeed)
                .max()
                .orElse(0.0) * 3.6;
    }

    private double getMinAltitude(List<LocationRequest> locationRequestList) {
        return locationRequestList.stream()
                .mapToDouble(LocationRequest::getAltitude)
                .min()
                .orElse(0.0);
    }

    private double getMaxAltitude(List<LocationRequest> locationRequestList) {
        return locationRequestList.stream()
                .mapToDouble(LocationRequest::getAltitude)
                .max()
                .orElse(0.0);
    }

    private Set<Marker> getMarkers(List<MarkerInfo> markerInfoList) {
        Set<Marker> markerSet = new HashSet<>();
        for (MarkerInfo markerInfo : markerInfoList) {
            Marker marker = new Marker();
            marker.setKey(markerInfo.getKey());
            marker.setName(markerInfo.getName());
            marker.setComment(markerInfo.getComment());
            marker.setLatitude(markerInfo.getCoordinate().getLatitude());
            marker.setLongitude(markerInfo.getCoordinate().getLongitude());
            markerSet.add(marker);
        }
        return markerSet;
    }

    // LinkedHashSet to keep the order of the set
    private Set<Coordinate> getCoordinates(List<LocationRequest> locationRequestList) {
        Set<Coordinate> coordinateSet = new LinkedHashSet<>();
        for (LocationRequest locationRequest : locationRequestList) {
            Coordinate coordinate = new Coordinate();
            coordinate.setLatitude(locationRequest.getLatitude());
            coordinate.setLongitude(locationRequest.getLongitude());
            coordinate.setTimestamp(locationRequest.getTimestamp());
            coordinateSet.add(coordinate);
        }
        return coordinateSet;
    }

    public void updateSharingStatus(Integer trackId, ShareTrackRequest shareTrackRequest) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new IllegalStateException("Track with id " + trackId + " does not exist"));

        track.setShared(shareTrackRequest.getShared());
        track.setBikeType(shareTrackRequest.getBikeType());
        track.setRouteType(shareTrackRequest.getRouteType());
        track.setLocation(shareTrackRequest.getLocation());
        track.setComment(shareTrackRequest.getComment());

        trackRepository.save(track);
    }
}
