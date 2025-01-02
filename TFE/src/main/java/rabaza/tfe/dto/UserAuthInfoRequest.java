package rabaza.tfe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
// used to log user in the backend, not called in frontend
public class UserAuthInfoRequest {
    private String login;
    private String password;
}
