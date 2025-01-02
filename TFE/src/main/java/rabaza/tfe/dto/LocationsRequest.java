package rabaza.tfe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationsRequest {
    @JsonProperty("locations")
    private List<LocationRequest> locationRequests;
    @JsonProperty("markers")
    private List<MarkerInfo> markerInfos;

    private Date startTime;

    private Date stopTime;

    private Integer pauseTime;

    private String userEmail;
}
