package com.dessec.services.auth;

import com.dessec.dto.SignupRequest;
import com.dessec.dto.UserDto;

public interface AuthService {

    UserDto createUser(SignupRequest signupRequest);

    Boolean hasUserWithEmail(String email);
}
