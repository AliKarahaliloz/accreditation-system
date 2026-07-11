package com.accreditation.core.dto.criterion;

import java.util.List;
import java.util.UUID;

public record CriterionResponse(
                UUID id,
                String code,
                String title,
                String description,
                List<CriterionResponse> subCriteria) {
}
