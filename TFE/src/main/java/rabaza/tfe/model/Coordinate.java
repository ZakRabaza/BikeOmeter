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
@Table(name = "coordinate")
@Builder
public class Coordinate {

    @Id
    @Column(name = "id")
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "coordinate_sequence"
    )
    @SequenceGenerator(
            name = "coordinate_sequence",
            sequenceName = "coordinate_sequence",
            allocationSize = 1
    )
    private Integer id;

    private Double latitude;
    private Double longitude;
    private Long timestamp;


    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "track_map_id", referencedColumnName = "id")
    @JsonIgnore
    @ToString.Exclude
    private TrackMap trackMap;
}
