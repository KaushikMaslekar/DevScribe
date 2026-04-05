package com.devscribe.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devscribe.dto.auth.AuthLoginRequest;
import com.devscribe.dto.auth.AuthRegisterRequest;
import com.devscribe.dto.auth.AuthResponse;
import com.devscribe.dto.auth.AuthTokenPayload;
import com.devscribe.dto.auth.UserMeResponse;
import com.devscribe.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String TOKEN_TYPE = "Bearer";
    private static final String AUTH_COOKIE = "devscribe_access_token";

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRegisterRequest request) {
        AuthTokenPayload payload = authService.register(request);
        return buildAuthResponse(payload);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthLoginRequest request) {
        AuthTokenPayload payload = authService.login(request);
        return buildAuthResponse(payload);
    }

    @GetMapping("/me")
    public ResponseEntity<UserMeResponse> me() {
        return ResponseEntity.ok(authService.me());
    }

    private ResponseEntity<AuthResponse> buildAuthResponse(AuthTokenPayload payload) {
        ResponseCookie authCookie = ResponseCookie.from(AUTH_COOKIE, payload.token())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(payload.expiresInMs() / 1000)
                .build();

        AuthResponse response = new AuthResponse(payload.token(), TOKEN_TYPE, payload.expiresInMs(), payload.user());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookie.toString())
                .body(response);
    }
}
