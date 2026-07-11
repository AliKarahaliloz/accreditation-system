package com.accreditation.core.dto.tenant;

public record TenantCreateRequest(
        String name,
        String subdomain) {
}
