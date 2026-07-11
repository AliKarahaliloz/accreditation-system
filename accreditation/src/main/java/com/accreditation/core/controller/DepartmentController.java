package com.accreditation.core.controller;

import com.accreditation.core.dto.department.DepartmentCreateRequest;
import com.accreditation.core.dto.department.DepartmentResponse;
import com.accreditation.core.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    public ResponseEntity<DepartmentResponse> createDepartment(@RequestBody @Valid DepartmentCreateRequest request) {
        return ResponseEntity.ok(departmentService.createDepartment(
                request.name(),
                request.headOfDepartment(),
                request.facultyId()));
    }

    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<List<DepartmentResponse>> getDepartmentsByFaculty(@PathVariable UUID facultyId) {
        return ResponseEntity.ok(departmentService.getAllDepartmentsByFaculty(facultyId));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<DepartmentResponse>> getDepartmentsByTenant(@PathVariable UUID tenantId) {
        return ResponseEntity.ok(departmentService.getAllDepartmentsByTenant(tenantId));
    }
}
