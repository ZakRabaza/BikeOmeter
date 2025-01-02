package rabaza.tfe.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "marker")
@Builder
public class Marker {

    @Id
    @Column(name = "id")
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "marker_sequence"
    )
    @SequenceGenerator(
            name = "marker_sequence",
            sequenceName = "marker_sequence",
            allocationSize = 1
    )
    private Integer id;
    private String key;
    private String name;
    private String comment;
    private Double latitude;
    private Double longitude;

    @ManyToOne
    @JoinColumn(name = "track_map_id", referencedColumnName = "id")
    @JsonIgnore
    @ToString.Exclude
    private TrackMap trackMap;
}
