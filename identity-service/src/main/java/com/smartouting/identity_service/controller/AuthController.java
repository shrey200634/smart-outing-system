package com.smartouting.identity_service.controller;

import com.smartouting.identity_service.dto.AuthRequest;
import com.smartouting.identity_service.entity.UserCredential;
import com.smartouting.identity_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    // 1. REGISTER (Sign Up)
    @PostMapping("/register")
    public String addNewUser(@RequestBody UserCredential user) {
        return service.saveUser(user);
    }

    // 2. LOGIN (Get Token)
    @PostMapping("/token")
    public String getToken(@RequestBody AuthRequest authRequest) {
        // We now pass BOTH username and password to the service to verify manually
        return service.generateToken(authRequest.getUsername(), authRequest.getPassword());
    }

    // 3. VALIDATE (Check Token)
    @GetMapping("/validate")
    public String validateToken(@RequestParam("token") String token) {
        service.validateToken(token);
        return "Token is valid";
    }
}