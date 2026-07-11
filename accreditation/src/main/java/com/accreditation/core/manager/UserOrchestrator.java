package com.accreditation.core.manager;

import com.accreditation.core.dto.user.UserCreateRequest;
import com.accreditation.core.dto.user.UserResponse;
import com.accreditation.core.entity.Department;
import com.accreditation.core.entity.Tenant;
import com.accreditation.core.repository.DepartmentRepository;
import com.accreditation.core.repository.RoleRepository;
import com.accreditation.core.repository.TenantRepository;
import com.accreditation.core.repository.OrganizationUnitRepository;
import com.accreditation.core.entity.Role;
import com.accreditation.core.entity.OrganizationUnit;
import com.accreditation.core.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import com.accreditation.core.security.CustomUserDetails;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserOrchestrator {

        private final UserService userService;
        private final TenantRepository tenantRepository;
        private final DepartmentRepository departmentRepository;
        private final RoleRepository roleRepository;
        private final OrganizationUnitRepository organizationUnitRepository;

        @Transactional
        public UserResponse createUser(UserCreateRequest request) {

                CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getPrincipal();
                UUID tenantId = userDetails.getUser().getTenant().getId();

                Tenant tenant = tenantRepository.findById(tenantId)
                                .orElseThrow(() -> new RuntimeException("University not found!"));

                Department department = null;
                if (request.departmentId() != null) {
                        department = departmentRepository.findById(request.departmentId())
                                        .orElseThrow(() -> new RuntimeException("Department not found!"));
                }

                OrganizationUnit organizationUnit = null;
                if (request.organizationUnitId() != null) {
                        organizationUnit = organizationUnitRepository.findById(request.organizationUnitId())
                                        .orElseThrow(() -> new RuntimeException("Organization Unit not found!"));
                }

                Role role = roleRepository.findById(request.roleId())
                                .orElseThrow(() -> new RuntimeException("Role not found: " + request.roleId()));

                return userService.createEntity(request.fullName(), request.email(), request.password(),
                                request.title(), role, tenant, department, organizationUnit);
        }
}
