package com.devscribe.security;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTH_COOKIE = "devscribe_access_token";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        String token = extractToken(request);

        if (StringUtils.hasText(token)
                && jwtTokenProvider.isValid(token)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                String subject = jwtTokenProvider.getSubject(token);
                if (StringUtils.hasText(subject)) {
                    UserDetails userDetails = customUserDetailsService.loadUserByUsername(subject);

                    UsernamePasswordAuthenticationToken authenticationToken
                            = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
            } catch (UsernameNotFoundException ex) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String method = request.getMethod();
        String servletPath = request.getServletPath();
        return "OPTIONS".equalsIgnoreCase(method)
                || ("POST".equalsIgnoreCase(method)
                && ("/auth/login".equals(servletPath) || "/auth/register".equals(servletPath)));
    }

    private String extractToken(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith(BEARER_PREFIX)) {
            return authorizationHeader.substring(BEARER_PREFIX.length());
        }

        if (request.getCookies() == null) {
            return null;
        }

        for (Cookie cookie : request.getCookies()) {
            if (AUTH_COOKIE.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
