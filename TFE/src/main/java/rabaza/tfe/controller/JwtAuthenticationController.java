package rabaza.tfe.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rabaza.tfe.jwt.JwtResponse;
import rabaza.tfe.jwt.JwtTokenUtil;
import rabaza.tfe.dto.UserAuthInfoRequest;
import rabaza.tfe.service.JwtUserDetailsService;

@CrossOrigin(origins = "*")
@RestController
public class JwtAuthenticationController {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    @Autowired
    private JwtUserDetailsService userDetailsService;

    @PostMapping(value = "/api/authenticate")
    @ResponseStatus(HttpStatus.OK)
    public JwtResponse createAuthenticationToken(@RequestBody UserAuthInfoRequest authenticationRequest) {
        final String token = jwtTokenUtil.authentication(authenticationRequest);
        return new JwtResponse(token);
    }
}
