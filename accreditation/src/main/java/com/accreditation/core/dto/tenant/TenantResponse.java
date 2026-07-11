package com.accreditation.core.dto.tenant;

import java.time.LocalDateTime;
import java.util.UUID;

public record TenantResponse(
        UUID id,
        String name,
        String subdomain,
        Boolean isActive,
        LocalDateTime createdAt) {
}

