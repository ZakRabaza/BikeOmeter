package rabaza.tfe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentInfo {

    private Integer id;
    private String content;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    private String authorEmail;
    private Integer trackId;
}
