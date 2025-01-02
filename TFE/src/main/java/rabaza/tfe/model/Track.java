package rabaza.tfe.model;

import lombok.*;
import org.hibernate.Hibernate;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table
@Builder
public class Track {
    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "track_sequence"
    )
    @SequenceGenerator(
            name = "track_sequence",
            sequenceName = "track_sequence",
            allocationSize = 1
    )
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

    private Boolean shared = false;

    private String bikeType;

    private String routeType;

    private String location;

    private String comment;

    @ManyToOne
    @JoinColumn(name = "owner_id", referencedColumnName = "id")
    private User owner;

    @OneToOne(mappedBy = "track", cascade = CascadeType.ALL, orphanRemoval = true)
    private TrackMap trackMap;

    @OneToMany(mappedBy = "track", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> comments = new HashSet<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        Track track = (Track) o;
        return id != null && Objects.equals(id, track.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
