package rabaza.tfe.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import rabaza.tfe.model.User;
import rabaza.tfe.repository.UserRepository;

import java.util.Collections;
import java.util.Optional;

@Slf4j
@Service
public class JwtUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder bcryptEncoder;

    @Override
    public UserDetails loadUserByUsername(String login) {
        Optional<User> optionalUserEntity = userRepository.findUserByEmail(login);
        if (optionalUserEntity.isEmpty()) {
            throw new UsernameNotFoundException("USER_NOT_FOUND_WITH_LOGIN: " + login);
        }
        User user = optionalUserEntity.get();
        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(),
                Collections.emptyList());
    }
}
