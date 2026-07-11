package com.accreditation.core.dto.department;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record DepartmentCreateRequest(
                String name,
                String headOfDepartment,
                @NotNull UUID facultyId) {
}
