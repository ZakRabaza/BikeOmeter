package rabaza.tfe.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rabaza.tfe.dto.RegistrationRequest;
import rabaza.tfe.dto.UserInfo;
import rabaza.tfe.service.UserService;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping(path = "api/v1/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<UserInfo> getUsers() {
        return userService.getUsers();
    }

    @PostMapping(path = "register")
    @ResponseStatus(HttpStatus.CREATED)
    public void registerNewUser(@RequestBody RegistrationRequest registrationRequest) {
        userService.addNewUser(registrationRequest);
    }

    @PutMapping
    @ResponseStatus(HttpStatus.OK)
    public void updateUser(@RequestBody UserInfo userInfo){
        userService.updateUser(userInfo);
    }

    @DeleteMapping(path = "{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable("userId") Integer userId) {
        userService.deleteUser(userId);
    }
}
