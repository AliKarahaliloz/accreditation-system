package com.accreditation.core.dto.criterion;

import java.util.List;
import java.util.UUID;

public record CriterionTreeResponse(
        UUID id,
        String code,
        String title,
        String description,
        List<CriterionTreeResponse> subCriteria) {
}
