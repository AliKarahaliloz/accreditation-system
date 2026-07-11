package com.accreditation.core.controller;

import com.accreditation.core.dto.validation.ValidationRuleCreateRequest;
import com.accreditation.core.dto.validation.ValidationRuleResponse;
import com.accreditation.core.service.ValidationRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/validation-rules")
@RequiredArgsConstructor
public class ValidationRuleController {

    private final ValidationRuleService validationRuleService;

    @PostMapping
    public ResponseEntity<ValidationRuleResponse> createRule(@RequestBody ValidationRuleCreateRequest request) {
        return ResponseEntity.ok(validationRuleService.createRule(request));
    }

    @GetMapping("/criterion/{criterionId}")
    public ResponseEntity<List<ValidationRuleResponse>> getRulesByCriterion(@PathVariable UUID criterionId) {
        return ResponseEntity.ok(validationRuleService.getRulesByCriterion(criterionId));
    }
}
