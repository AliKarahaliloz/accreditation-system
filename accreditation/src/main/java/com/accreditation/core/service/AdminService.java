package com.accreditation.core.service;

import com.accreditation.core.entity.Role;
import com.accreditation.core.entity.User;
import com.accreditation.core.repository.RoleRepository;
import com.accreditation.core.repository.UserRepository;
import com.accreditation.core.repository.DepartmentRepository;
import com.accreditation.core.repository.OrganizationUnitRepository;
import com.accreditation.core.entity.Department;
import com.accreditation.core.entity.OrganizationUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final OrganizationUnitRepository organizationUnitRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void updateUserRole(UUID userId, UUID roleId, User admin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (!user.getTenant().getId().equals(admin.getTenant().getId())) {
            throw new RuntimeException("Bu kullanıcıya erişim yetkiniz yok.");
        }

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rol bulunamadı"));

        user.setRole(role);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID userId, User admin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (!user.getTenant().getId().equals(admin.getTenant().getId())) {
            throw new RuntimeException("Bu kullanıcıya erişim yetkiniz yok.");
        }

        userRepository.delete(user);
    }

    @Transactional
    public void updateUserUnit(UUID userId, UUID departmentId, UUID orgUnitId, User admin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (!user.getTenant().getId().equals(admin.getTenant().getId())) {
            throw new RuntimeException("Bu kullanıcıya erişim yetkiniz yok.");
        }

        if (departmentId != null) {
            Department dept = departmentRepository.findById(departmentId)
                    .orElseThrow(() -> new RuntimeException("Bölüm bulunamadı"));
            user.setDepartment(dept);
        } else {
            user.setDepartment(null);
        }

        if (orgUnitId != null) {
            OrganizationUnit unit = organizationUnitRepository.findById(orgUnitId)
                    .orElseThrow(() -> new RuntimeException("Birim bulunamadı"));
            user.setOrganizationUnit(unit);
        } else {
            user.setOrganizationUnit(null);
        }

        userRepository.save(user);
    }

    @Transactional
    public void updateUserProfile(UUID userId, String fullName, String email, String title, User admin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (!user.getTenant().getId().equals(admin.getTenant().getId())) {
            throw new RuntimeException("Bu kullanıcıya erişim yetkiniz yok.");
        }

        if (fullName != null && !fullName.isBlank()) {
            user.setFullName(fullName);
        }
        if (email != null && !email.isBlank()) {
            userRepository.findByEmail(email).ifPresent(existing -> {
                if (!existing.getId().equals(userId)) {
                    throw new RuntimeException("Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.");
                }
            });
            user.setEmail(email);
        }
        if (title != null) {
            user.setTitle(title);
        }

        userRepository.save(user);
    }

    @Transactional
    public void resetUserPassword(UUID userId, String newPassword, User admin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (!user.getTenant().getId().equals(admin.getTenant().getId())) {
            throw new RuntimeException("Bu kullanıcıya erişim yetkiniz yok.");
        }

        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Yeni şifre en az 6 karakter olmalıdır.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
}
