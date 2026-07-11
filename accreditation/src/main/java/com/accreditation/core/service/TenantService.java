package com.accreditation.core.service;

import com.accreditation.core.dto.tenant.TenantResponse;
import com.accreditation.core.entity.Tenant;
import com.accreditation.core.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;

    @Transactional
    public TenantResponse createTenant(String name, String subdomain) {
        if (tenantRepository.existsBySubdomain(subdomain)) {
            throw new RuntimeException("This subdomain already used: " + subdomain);
        }

        Tenant tenant = new Tenant();
        tenant.setName(name);
        tenant.setSubdomain(subdomain);
        tenant.setIsActive(true);

        Tenant savedTenant = tenantRepository.save(tenant);
        return mapToResponse(savedTenant);
    }

    public List<TenantResponse> getAllTenants() {
        return tenantRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    private TenantResponse mapToResponse(Tenant tenant) {
        return new TenantResponse(
                tenant.getId(),
                tenant.getName(),
                tenant.getSubdomain(),
                tenant.getIsActive(),
                tenant.getCreatedAt());
    }
}
