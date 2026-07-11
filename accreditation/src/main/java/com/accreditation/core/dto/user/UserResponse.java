package com.accreditation.core.dto.user;

import java.util.UUID;

public record UserResponse(
                UUID id,
                String fullName,
                String email,
                String title,
                String role,
                UUID roleId,
                UUID tenantId,
                UUID departmentId,
                String departmentName,
                UUID facultyId,
                UUID organizationUnitId,
                String organizationUnitName) {
}
