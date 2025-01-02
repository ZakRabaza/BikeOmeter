package rabaza.tfe.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rabaza.tfe.dto.MarkerInfo;
import rabaza.tfe.mapper.MarkerMapper;
import rabaza.tfe.model.Marker;
import rabaza.tfe.model.TrackMap;
import rabaza.tfe.repository.MarkerRepository;
import rabaza.tfe.repository.TrackMapRepository;

import java.util.List;
import java.util.Objects;

@Service
public class MarkerService {

    private final MarkerRepository markerRepository;
    private final TrackMapRepository trackMapRepository;

    @Autowired
    public MarkerService(MarkerRepository markerRepository, TrackMapRepository trackMapRepository) {
        this.markerRepository = markerRepository;
        this.trackMapRepository = trackMapRepository;
    }

    @Transactional(readOnly = true)
    public List<MarkerInfo> getMarkers() {
        return MarkerMapper.INSTANCE.markersToMarkersInfo(markerRepository.findAll());
    }
    @Transactional(readOnly = true)
    public List<MarkerInfo> getMarkersByTrackMapId(Integer trackMapId) {
        return MarkerMapper.INSTANCE.markersToMarkersInfo(markerRepository.findByTrackMapId(trackMapId));
    }

    @Transactional(readOnly = true)
    public MarkerInfo getMarkerById(Integer markerId) {
        Marker marker = markerRepository.findById(markerId)
                .orElseThrow(() -> new IllegalStateException("Marker with id " + markerId + " does not exist"));
        return MarkerMapper.INSTANCE.markerToMarkerInfo(marker);
    }

    @Transactional
    public Marker addNewMarker(MarkerInfo markerInfo) {
        Marker marker = new Marker();
        marker.setKey(markerInfo.getKey());
        marker.setName(markerInfo.getName());
        marker.setComment(markerInfo.getComment());

        if (markerInfo.getCoordinate() != null) {
            marker.setLatitude(markerInfo.getCoordinate().getLatitude());
            marker.setLongitude(markerInfo.getCoordinate().getLongitude());
        } else {
            throw new IllegalArgumentException("Coordinate information is required");
        }

        TrackMap trackMap = trackMapRepository.findById(markerInfo.getTrackMapId())
                .orElseThrow(() -> new IllegalStateException("TrackMap with id " + markerInfo.getTrackMapId() + " does not exist"));
        marker.setTrackMap(trackMap);

        return markerRepository.save(marker);
    }

    @Transactional
    public void updateMarker(MarkerInfo markerInfo) {
        Marker marker = markerRepository.findById(markerInfo.getId())
                .orElseThrow(() -> new IllegalStateException("Marker with id " + markerInfo.getId() + " does not exist"));

        // Update marker name if the provided name is not null, not empty, and different from the current name
        if (markerInfo.getName() != null && !Objects.equals(marker.getName(), markerInfo.getName())) {
            marker.setName(markerInfo.getName());
        }
//todo change the commentary
        // Update marker comment if the provided birthday is not null and different from the current birthday
        if (markerInfo.getComment() != null && !Objects.equals(marker.getComment(), markerInfo.getComment())) {
            marker.setComment(markerInfo.getComment());
        }
    }
    
    @Transactional
    public void deleteMarker(Integer markerId) {
        if (!markerRepository.existsById(markerId)) {
            throw new IllegalStateException("Marker with id " + markerId + " does not exist");
        }
        markerRepository.deleteById(markerId);
    }
}
