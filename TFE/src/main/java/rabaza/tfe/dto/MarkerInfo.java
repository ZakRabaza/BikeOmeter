package rabaza.tfe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarkerInfo {

        private Integer id;
        private String key;
        private String name;
        private String comment;
        private CoordinateRequest coordinate;
        private Integer trackMapId;

}
