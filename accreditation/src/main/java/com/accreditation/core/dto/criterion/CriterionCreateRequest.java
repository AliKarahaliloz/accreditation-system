package com.accreditation.core.dto.criterion;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record CriterionCreateRequest(
        @NotBlank(message = "Code is required") String code,
        @NotBlank(message = "Title is required") String title,
        String description,
        UUID parentCriterionId) {
}
