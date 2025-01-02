package rabaza.tfe.model;

import lombok.*;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Locations {
    private List<Location> locationsList;
    private List<Marker> markersList;
    private Date startTime;
    private Date stopTime;
    private Integer pauseTime;
    private String userEmail;

}
