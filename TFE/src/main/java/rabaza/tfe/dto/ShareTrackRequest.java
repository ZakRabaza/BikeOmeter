package rabaza.tfe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShareTrackRequest {
    private Boolean shared;
    private String bikeType;
    private String routeType;
    private String location;
    private String comment;

}

