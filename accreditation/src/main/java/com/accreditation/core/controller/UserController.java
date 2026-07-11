package com.accreditation.core.controller;

import com.accreditation.core.dto.user.UserCreateRequest;
import com.accreditation.core.dto.user.UserResponse;
import com.accreditation.core.manager.UserOrchestrator;
import com.accreditation.core.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import com.accreditation.core.security.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserOrchestrator userOrchestrator;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_SYS_ADMIN')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.ok(userOrchestrator.createUser(request));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<UserResponse>> getUsersByTenant(@PathVariable UUID tenantId) {
        return ResponseEntity.ok(userService.getAllUsersByTenant(tenantId));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<UserResponse>> getUsersByDepartment(@PathVariable UUID departmentId) {
        return ResponseEntity.ok(userService.getAllUsersByDepartment(departmentId));
    }

    @GetMapping("/subordinates")
    public ResponseEntity<List<UserResponse>> getSubordinates(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getSubordinates(userDetails.getUser()));
    }
}
