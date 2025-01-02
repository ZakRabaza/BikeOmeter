package rabaza.tfe.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "track_map")
@Builder
public class TrackMap {

    @Id
    @Column(name = "id")
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "track_map_sequence"
    )
    @SequenceGenerator(
            name = "track_map_sequence",
            sequenceName = "track_map_sequence",
            allocationSize = 1
    )
    private Integer id;

    // Set of coordinate that represents the line on the map
    @OneToMany(mappedBy = "trackMap", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Coordinate> polyCoordinates = new HashSet<>();


    @OneToMany(mappedBy = "trackMap", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Marker> markers = new HashSet<>();

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "track_id", referencedColumnName = "id")
    @JsonIgnore
    @ToString.Exclude
    private Track track;
}
