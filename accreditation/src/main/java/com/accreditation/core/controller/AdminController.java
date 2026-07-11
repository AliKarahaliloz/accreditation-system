package com.accreditation.core.controller;

import com.accreditation.core.dto.user.UserCreateRequest;
import com.accreditation.core.dto.user.UserResponse;
import com.accreditation.core.dto.faculty.FacultyResponse;
import com.accreditation.core.dto.department.DepartmentResponse;
import com.accreditation.core.manager.UserOrchestrator;
import com.accreditation.core.security.CustomUserDetails;
import com.accreditation.core.service.AdminService;
import com.accreditation.core.service.FacultyService;
import com.accreditation.core.service.DepartmentService;
import com.accreditation.core.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_SYS_ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;
    private final UserOrchestrator userOrchestrator;
    private final FacultyService facultyService;
    private final DepartmentService departmentService;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getTenantUsers(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getAllUsersByTenant(userDetails.getUser().getTenant().getId()));
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(
            @RequestBody UserCreateRequest request) {
        return ResponseEntity.status(201).body(userOrchestrator.createUser(request));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        UUID roleId = UUID.fromString(body.get("roleId"));
        adminService.updateUserRole(id, roleId, userDetails.getUser());
        return ResponseEntity.ok(Map.of("message", "Rol başarıyla güncellendi"));
    }

    @PutMapping("/users/{id}/unit")
    public ResponseEntity<?> updateUserUnit(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        UUID departmentId = body.containsKey("departmentId") && body.get("departmentId") != null
                && !body.get("departmentId").isEmpty() ? UUID.fromString(body.get("departmentId")) : null;
        UUID orgUnitId = body.containsKey("organizationUnitId") && body.get("organizationUnitId") != null
                && !body.get("organizationUnitId").isEmpty() ? UUID.fromString(body.get("organizationUnitId")) : null;

        adminService.updateUserUnit(id, departmentId, orgUnitId, userDetails.getUser());
        return ResponseEntity.ok(Map.of("message", "Birim başarıyla güncellendi"));
    }

    @PutMapping("/users/{id}/profile")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        String fullName = body.get("fullName");
        String email = body.get("email");
        String title = body.get("title");
        adminService.updateUserProfile(id, fullName, email, title, userDetails.getUser());
        return ResponseEntity.ok(Map.of("message", "Kullanıcı profili başarıyla güncellendi"));
    }

    @PutMapping("/users/{id}/password")
    public ResponseEntity<?> resetUserPassword(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        String newPassword = body.get("newPassword");
        adminService.resetUserPassword(id, newPassword, userDetails.getUser());
        return ResponseEntity.ok(Map.of("message", "Şifre başarıyla sıfırlandı"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        adminService.deleteUser(id, userDetails.getUser());
        return ResponseEntity.ok(Map.of("message", "Kullanıcı başarıyla silindi"));
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Map<String, Object>>> getRoles() {
        List<Map<String, Object>> roles = adminService.getAllRoles().stream().map(role -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", role.getId());
            map.put("name", role.getName());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/faculties")
    public ResponseEntity<List<FacultyResponse>> getFaculties(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                facultyService.getAllFacultiesByTenant(userDetails.getUser().getTenant().getId()));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentResponse>> getDepartments(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                departmentService.getAllDepartmentsByTenant(userDetails.getUser().getTenant().getId()));
    }
}
