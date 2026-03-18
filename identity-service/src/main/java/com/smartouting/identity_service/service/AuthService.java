package com.smartouting.identity_service.service;

import com.smartouting.identity_service.entity.UserCredential;
import com.smartouting.identity_service.repository.UserCredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    //wardern key
 //   eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJXYXJkZW4gVHdvIiwiaWF0IjoxNzcwMDY1MjE0LCJleHAiOjE3NzAwNjcwMTR9.nAInPNbwkikTySetikuRZUaIzG_gTNYTGwBV5IWt1PE

    @Autowired
    private UserCredentialRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    // 1. REGISTER: Encrypt password before saving
    public String saveUser(UserCredential credential) {
        // Hash the password (e.g., "pass123" -> "$2a$10$...")
        credential.setPassword(passwordEncoder.encode(credential.getPassword()));
        repository.save(credential);
        return "User added successfully";
    }

    // 2. LOGIN: Verify password and Generate Token
    public String generateToken(String username, String rawPassword) {
        // Find the user
        UserCredential user = repository.findByName(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Check if password matches
        if (passwordEncoder.matches(rawPassword, user.getPassword())) {
            return jwtService.generateToken(username);
        } else {
            throw new RuntimeException("Invalid Access: Wrong Password");
        }
    }

    // 3. VALIDATE
    public void validateToken(String token) {
        jwtService.validateToken(token);
    }
}