package com.accreditation.core.controller;

import com.accreditation.core.dto.faculty.FacultyCreateRequest;
import com.accreditation.core.dto.faculty.FacultyResponse;
import com.accreditation.core.service.FacultyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/faculties")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyService facultyService;

    @PostMapping
    public ResponseEntity<FacultyResponse> createFaculty(@RequestBody @Valid FacultyCreateRequest request) {
        return ResponseEntity
                .ok(facultyService.createFaculty(request.name(), request.directorName(), request.tenantId()));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<FacultyResponse>> getFacultiesByTenant(@PathVariable UUID tenantId) {
        return ResponseEntity.ok(facultyService.getAllFacultiesByTenant(tenantId));
    }
}
