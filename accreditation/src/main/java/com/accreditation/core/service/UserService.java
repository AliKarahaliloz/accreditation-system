package com.accreditation.core.service;

import com.accreditation.core.dto.user.UserResponse;
import com.accreditation.core.entity.Department;
import com.accreditation.core.entity.Tenant;
import com.accreditation.core.entity.User;
import com.accreditation.core.entity.Role;
import com.accreditation.core.entity.OrganizationUnit;
import com.accreditation.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class UserService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final RoleService roleService;

        public UserResponse createEntity(
                        String fullName, String email, String password, String title,
                        Role role, Tenant tenant, Department department, OrganizationUnit organizationUnit) {

                if (userRepository.findByEmail(email).isPresent()) {
                        throw new RuntimeException("Bu e-posta adresi zaten kullanımda!");
                }

                User user = new User();
                user.setFullName(fullName);
                user.setEmail(email);
                user.setPasswordHash(passwordEncoder.encode(password));
                user.setTitle(title);
                user.setRole(role);
                user.setTenant(tenant);
                user.setDepartment(department);
                user.setOrganizationUnit(organizationUnit);

                User savedUser = userRepository.save(user);
                return toResponse(savedUser);
        }

        public List<UserResponse> getAllUsersByTenant(UUID tenantId) {
                return userRepository.findAllByTenantId(tenantId).stream()
                                .map(UserService::toResponse)
                                .collect(Collectors.toList());
        }

        public List<UserResponse> getAllUsersByDepartment(UUID departmentId) {
                return userRepository.findAllByDepartmentId(departmentId).stream()
                                .map(UserService::toResponse)
                                .collect(Collectors.toList());
        }

        public List<UserResponse> getSubordinates(User currentUser) {
                List<User> allTenantUsers = userRepository.findAllByTenantId(currentUser.getTenant().getId());

                return allTenantUsers.stream()
                                .filter(u -> !u.getId().equals(currentUser.getId())
                                                && roleService.hasPermission(currentUser, u))
                                .map(UserService::toResponse)
                                .collect(Collectors.toList());
        }

        public static UserResponse toResponse(User u) {
                return new UserResponse(
                                u.getId(),
                                u.getFullName(),
                                u.getEmail(),
                                u.getTitle(),
                                u.getRole() != null ? u.getRole().getName() : null,
                                u.getRole() != null ? u.getRole().getId() : null,
                                u.getTenant().getId(),
                                u.getDepartment() != null ? u.getDepartment().getId() : null,
                                u.getDepartment() != null ? u.getDepartment().getName() : null,
                                u.getDepartment() != null && u.getDepartment().getFaculty() != null
                                                ? u.getDepartment().getFaculty().getId()
                                                : null,
                                u.getOrganizationUnit() != null ? u.getOrganizationUnit().getId() : null,
                                u.getOrganizationUnit() != null ? u.getOrganizationUnit().getName() : null);
        }
}
