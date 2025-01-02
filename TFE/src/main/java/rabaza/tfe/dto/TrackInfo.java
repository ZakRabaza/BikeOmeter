package rabaza.tfe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrackInfo {
    private Integer id;
    private LocalDateTime date;
    private LocalTime totalTime;
    private Double distance;
    private Double calories;
    private Double averageSpeed;
    private Double maxSpeed;
    private LocalTime pauseTime;
    private LocalTime activeTime;
    private LocalTime startTime;
    private LocalTime finishTime;
    private Double maxAltitude;
    private Double minAltitude;
    private Double startAltitude;
    private Double finishAltitude;

    private String bikeType;
    private String routeType;
    private String location;
    private String comment;

    // New fields for track map data
    private TrackMapInfo trackMap;

    @Data
    @AllArgsConstructor
    public static class TrackMapInfo {
        private Integer id;
        private Set<CoordinateInfo> polyCoordinates;
        private Set<MarkerInfo> markers;
    }

    @Data
    @AllArgsConstructor
    public static class CoordinateInfo {
        private Double latitude;
        private Double longitude;
        private Long timestamp;
    }

    @Data
    @AllArgsConstructor
    public static class MarkerInfo {
        private Integer id;
        private String key;
        private String name;
        private String comment;
        private Double latitude;
        private Double longitude;
    }
}
