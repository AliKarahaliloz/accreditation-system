package com.accreditation.core.dto.validation;

import jakarta.validation.constraints.NotNull;
import java.util.Map;
import java.util.UUID;

public record ValidationRuleCreateRequest(
        @NotNull UUID criterionId,
        @NotNull String ruleType,
        @NotNull Map<String, Object> parameters,
        @NotNull String errorMessage) {
}
