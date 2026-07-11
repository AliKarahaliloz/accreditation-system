package com.accreditation.core.controller;

import com.accreditation.core.dto.puko.PukoSubmissionReq;
import com.accreditation.core.dto.puko.PukoSubmissionResp;
import com.accreditation.core.entity.User;
import com.accreditation.core.security.CustomUserDetails;
import com.accreditation.core.service.PukoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/puko")
@RequiredArgsConstructor
public class PukoController {

    private final PukoService pukoService;

    @PostMapping
    public ResponseEntity<PukoSubmissionResp> createOrUpdatePuko(
            @Valid @RequestBody PukoSubmissionReq request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User currentUser = userDetails.getUser();
        PukoSubmissionResp response = pukoService.createOrUpdatePuko(request, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/criterion/{criterionId}")
    public ResponseEntity<PukoSubmissionResp> getPukoByCriterionId(
            @PathVariable UUID criterionId) {

        PukoSubmissionResp response = pukoService.getPukoByCriterionId(criterionId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<PukoSubmissionResp> getPukoByTaskId(
            @PathVariable UUID taskId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User currentUser = userDetails.getUser();
        PukoSubmissionResp response = pukoService.getPukoByTaskId(taskId, currentUser);
        return ResponseEntity.ok(response);
    }
}
