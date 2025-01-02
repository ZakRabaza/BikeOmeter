package rabaza.tfe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {
    private String name;
    private String email;
    private LocalDate birthDay;
    private String gender;
    private Double height;
    private Double weight;
    private Integer age;

}
