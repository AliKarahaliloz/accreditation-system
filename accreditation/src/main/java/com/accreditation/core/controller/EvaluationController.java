package com.accreditation.core.controller;

import com.accreditation.core.dto.evaluation.CriterionEvaluationReq;
import com.accreditation.core.dto.evaluation.CriterionEvaluationResp;
import com.accreditation.core.entity.User;
import com.accreditation.core.security.CustomUserDetails;
import com.accreditation.core.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping
    public ResponseEntity<CriterionEvaluationResp> submitEvaluation(
            @Valid @RequestBody CriterionEvaluationReq request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        User currentUser = userDetails.getUser();
        CriterionEvaluationResp response = evaluationService.createOrUpdateEvaluation(request, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/criterion/{criterionId}")
    public ResponseEntity<CriterionEvaluationResp> getEvaluationByCriterionId(
            @PathVariable UUID criterionId) {
        
        CriterionEvaluationResp response = evaluationService.getEvaluationByCriterionId(criterionId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<CriterionEvaluationResp> getEvaluationByTaskId(
            @PathVariable UUID taskId) {
        
        CriterionEvaluationResp response = evaluationService.getEvaluationByTaskId(taskId);
        return ResponseEntity.ok(response);
    }
}
