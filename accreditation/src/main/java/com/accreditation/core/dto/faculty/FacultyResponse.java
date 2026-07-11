package com.accreditation.core.dto.faculty;

import java.util.UUID;

public record FacultyResponse(
        UUID id,
        String name,
        String directorName,
        UUID tenantId) {
}
