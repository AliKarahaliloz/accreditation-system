package com.accreditation.core.controller;

import com.accreditation.core.dto.evidence.EvidenceResponse;
import com.accreditation.core.manager.EvidenceOrchestrator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks/{taskId}/evidence")
@RequiredArgsConstructor
public class EvidenceController {

    private final EvidenceOrchestrator evidenceOrchestrator;

    @PostMapping
    public ResponseEntity<EvidenceResponse> uploadEvidence(
            @PathVariable UUID taskId,
            @RequestParam("file") MultipartFile file) throws IOException {

        EvidenceResponse response = evidenceOrchestrator.uploadEvidence(taskId, file);
        return ResponseEntity.ok(response);
    }
}

