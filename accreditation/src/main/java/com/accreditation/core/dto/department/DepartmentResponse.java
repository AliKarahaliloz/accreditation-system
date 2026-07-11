package com.accreditation.core.dto.department;

import java.util.UUID;

public record DepartmentResponse(
        UUID id,
        String name,
        String headOfDepartment,
        UUID facultyId) {
}
