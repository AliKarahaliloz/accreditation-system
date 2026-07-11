package com.accreditation.core.controller;

import com.accreditation.core.dto.criterion.CriterionCreateRequest;
import com.accreditation.core.dto.criterion.CriterionResponse;
import com.accreditation.core.dto.criterion.CriterionTreeResponse;
import com.accreditation.core.service.CriterionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/criteria")
@RequiredArgsConstructor
public class CriterionController {

    private final CriterionService criterionService;

    @PostMapping
    @PreAuthorize("hasRole('SYS_ADMIN')")
    public ResponseEntity<CriterionResponse> createCriterion(@Valid @RequestBody CriterionCreateRequest request) {
        return ResponseEntity.ok(criterionService.createCriterion(request));
    }

    @GetMapping("/flat")
    public ResponseEntity<List<CriterionResponse>> getFlatCriteria() {
        return ResponseEntity.ok(criterionService.getFlatCriteria());
    }

    @GetMapping("/tree")
    public ResponseEntity<List<CriterionTreeResponse>> getCriteriaTree(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.accreditation.core.security.CustomUserDetails userDetails) {
        return ResponseEntity.ok(criterionService.getCriteriaTree(userDetails.getUser()));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<CriterionResponse> getCriterionByCode(@PathVariable String code) {
        return ResponseEntity.ok(criterionService.getCriterionByCode(code));
    }
}
