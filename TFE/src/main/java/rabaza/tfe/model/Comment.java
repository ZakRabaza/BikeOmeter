package rabaza.tfe.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import javax.persistence.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "comments")
@Builder
public class Comment {

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "comment_sequence"
    )
    @SequenceGenerator(
            name = "comment_sequence",
            sequenceName = "comment_sequence",
            allocationSize = 1
    )
    private Integer id;
    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime createdDate;

    @Column(nullable = true)
    private LocalDateTime modifiedDate;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private User author;

    @ManyToOne
    @JoinColumn(name = "track_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private Track track;

    public void editContent(String newContent) {
        this.content = newContent;
        this.modifiedDate = LocalDateTime.now();
    }

    public boolean isAuthor(User user) {
        return this.author.equals(user);
    }
}
