package com.accreditation.core.dto.user;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record UserCreateRequest(
        @NotBlank(message = "Full name is required") String fullName,
        @NotBlank(message = "Email is required") String email,
        @NotBlank(message = "Password is required") String password,
        String title,
        UUID roleId,
        UUID facultyId,
        UUID departmentId,
        UUID organizationUnitId) {
}
