package com.accreditation.core.dto.validation;

import java.util.Map;
import java.util.UUID;

public record ValidationRuleResponse(
        UUID id,
        UUID criterionId,
        String ruleType,
        Map<String, Object> parameters,
        String errorMessage) {
}
