package com.accreditation.core.controller;

import com.accreditation.core.dto.tenant.TenantCreateRequest;
import com.accreditation.core.dto.tenant.TenantResponse;
import com.accreditation.core.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @PostMapping
    public ResponseEntity<TenantResponse> createTenant(@RequestBody TenantCreateRequest request) {
        TenantResponse newTenant = tenantService.createTenant(request.name(), request.subdomain());

        return ResponseEntity.ok(newTenant);
    }

    @GetMapping
    public ResponseEntity<List<TenantResponse>> getAllTenants() {
        return ResponseEntity.ok(tenantService.getAllTenants());
    }
}
