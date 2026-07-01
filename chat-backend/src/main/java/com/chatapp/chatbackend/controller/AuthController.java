package com.chatapp.chatbackend.controller;

import com.chatapp.chatbackend.entity.User;
import com.chatapp.chatbackend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        user.setOnline(false);
        user.setLastSeen(LocalDateTime.now());

        return userRepository.save(user);
    }

    @PostMapping("/login")
    public User loginUser(@RequestBody User loginRequest) {
        User user = userRepository
                .findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(loginRequest.getPassword())) {
            throw new RuntimeException("Wrong password");
        }

        user.setOnline(true);
        user.setLastSeen(null);

        return userRepository.save(user);
    }

    @PostMapping("/online/{name}")
    public User onlineUser(@PathVariable String name) {
        User user = userRepository
                .findByName(name)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setOnline(true);
        user.setLastSeen(null);

        return userRepository.save(user);
    }

    @PostMapping("/offline/{name}")
    public User offlineUser(@PathVariable String name) {
        return makeUserOffline(name);
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/logout/{name}")
    public User logoutUser(@PathVariable String name) {
        return makeUserOffline(name);
    }

    private User makeUserOffline(String name) {
        User user = userRepository
                .findByName(name)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setOnline(false);
        user.setLastSeen(LocalDateTime.now());

        return userRepository.save(user);
    }
}