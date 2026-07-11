package com.accreditation.core.manager;

import com.accreditation.core.dto.evidence.EvidenceResponse;
import com.accreditation.core.entity.EvidenceFile;
import com.accreditation.core.entity.Task;
import com.accreditation.core.entity.User;
import com.accreditation.core.repository.TaskRepository;
import com.accreditation.core.repository.UserRepository;
import com.accreditation.core.security.CustomUserDetails;
import com.accreditation.core.service.EvidenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EvidenceOrchestrator {

    private final EvidenceService evidenceService;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional
    public EvidenceResponse uploadEvidence(UUID taskId, MultipartFile file) throws IOException {

        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        UUID tenantId = userDetails.getUser().getTenant().getId();
        UUID userId = userDetails.getUser().getId();

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found!"));

        if (!task.getTenant().getId().equals(tenantId)) {
            throw new RuntimeException("Task does not belong to your university!");
        }

        User uploader = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Uploader not found!"));

        EvidenceFile savedEvidence = evidenceService.createEntity(file, task, uploader);

        return new EvidenceResponse(
                savedEvidence.getId(),
                savedEvidence.getFileName(),
                savedEvidence.getFilePath(),
                savedEvidence.getUploadedAt());
    }
}

