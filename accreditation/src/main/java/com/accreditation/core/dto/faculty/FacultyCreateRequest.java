package com.accreditation.core.dto.faculty;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record FacultyCreateRequest(
                String name,
                String directorName,
                @NotNull UUID tenantId) {
}
