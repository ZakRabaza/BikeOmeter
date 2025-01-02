package rabaza.tfe.service;

import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import rabaza.tfe.dto.RegistrationRequest;
import rabaza.tfe.dto.UserInfo;
import rabaza.tfe.exception.EmailTakenException;
import rabaza.tfe.mapper.UserMapper;
import rabaza.tfe.model.User;
import rabaza.tfe.model.UserGender;
import rabaza.tfe.model.UserRole;
import rabaza.tfe.repository.UserRepository;
import rabaza.tfe.utils.EmailValidator;
import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;


@Service
@AllArgsConstructor
public class UserService implements UserDetailsService {

    private static final  String USER_NOT_FOUND_MSG = "user with email %s not found";
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final EmailValidator emailValidator;

    // Function used by springframework.security : jwt security
    // Email used instead of the username: email cannot be changed
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findUserByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                String.format(USER_NOT_FOUND_MSG, email)));
    }

    public List<UserInfo> getUsers() {
        return UserMapper.INSTANCE.usersToUsersInfo(userRepository.findAll());
    }

    public UserInfo getUserById(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("user with id " + userId + " does not exist"));
        return UserMapper.INSTANCE.userToUserInfo(user);
    }

    public void addNewUser(RegistrationRequest registrationRequest) {

        boolean isValidEmail = emailValidator.
                test(registrationRequest.getEmail());

        if (!isValidEmail) {
            throw new IllegalStateException("email not valid");
        }

        User user = User.builder()
                .name(registrationRequest.getName())
                .email(registrationRequest.getEmail())
                .role(UserRole.USER)
                .birthDay(LocalDate.of(2000,01,01))
                .gender(UserGender.MALE)
                .height(175.0)
                .weight(80.0)
                .enable(true)
                .locked(false)
                .build();

        signUpUser(user, registrationRequest.getPassword());
    }

    @Transactional // Ensures that all database operations are part of a single transaction
    public void updateUser(UserInfo userInfoRequest) {
        // Find the user by email, throw an exception if not found
        User user = userRepository.findUserByEmail(userInfoRequest.getEmail())
                .orElseThrow(() -> new IllegalStateException("User with email " + userInfoRequest.getEmail() + " does not exist"));

        // Update user name if the provided name is not null, not empty, and different from the current name
        if (userInfoRequest.getName() != null && userInfoRequest.getName().length() > 0 && !Objects.equals(user.getName(), userInfoRequest.getName())) {
            user.setName(userInfoRequest.getName());
        }

        // Update user birthday if the provided birthday is not null and different from the current birthday
        if (userInfoRequest.getBirthDay() != null && !Objects.equals(user.getBirthDay(), userInfoRequest.getBirthDay())) {
            user.setBirthDay(userInfoRequest.getBirthDay());
        }

        // Update user gender if the provided gender is not null and different from the current gender
        if (userInfoRequest.getGender() != null && !Objects.equals(user.getGender().toString(), userInfoRequest.getGender().toUpperCase())) {
            user.setGender(UserGender.valueOf(userInfoRequest.getGender().toUpperCase()));
        }

        // Update user height if the provided height is not null and different from the current height
        if (userInfoRequest.getHeight() != null && !Objects.equals(user.getHeight(), userInfoRequest.getHeight())) {
            user.setHeight(userInfoRequest.getHeight());
        }

        // Update user weight if the provided weight is not null and different from the current weight
        if (userInfoRequest.getWeight() != null && !Objects.equals(user.getWeight(), userInfoRequest.getWeight())) {
            user.setWeight(userInfoRequest.getWeight());
        }
    }

    public void deleteUser(Integer userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalStateException("user with id " + userId + " does not exist");
        }
        userRepository.deleteById(userId);
    }

    public void signUpUser(User user, String password) {
        boolean userExists = userRepository
                .findUserByEmail(user.getEmail())
                .isPresent();

        if (userExists) {
            throw new EmailTakenException("EMAIL_ALREADY_TAKEN");
        }

        String encodedPassword = bCryptPasswordEncoder
                .encode(password);

        user.setPassword(encodedPassword);

        userRepository.save(user);
    }

}
