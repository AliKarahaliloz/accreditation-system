package com.accreditation.core.service;

import com.accreditation.core.dto.puko.PukoSubmissionReq;
import com.accreditation.core.dto.puko.PukoSubmissionResp;
import com.accreditation.core.entity.Criterion;
import com.accreditation.core.entity.PukoSubmission;
import com.accreditation.core.entity.Task;
import com.accreditation.core.entity.User;
import com.accreditation.core.repository.CriterionRepository;
import com.accreditation.core.repository.PukoSubmissionRepository;
import com.accreditation.core.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PukoService {

    private final PukoSubmissionRepository pukoRepository;
    private final CriterionRepository criterionRepository;
    private final TaskRepository taskRepository;

    public PukoSubmissionResp createOrUpdatePuko(PukoSubmissionReq request, User currentUser) {
        UUID criterionId = request.getCriterionId();
        Task task = null;
        if (request.getTaskId() != null) {
            task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
            if (criterionId == null && task.getCriterion() != null) {
                criterionId = task.getCriterion().getId();
            }
        }

        if (criterionId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Criterion ID is required (or must be inferrable from Task)");
        }

        Criterion criterion = criterionRepository.findById(criterionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Criterion not found"));

        PukoSubmission puko;
        if (task != null) {
            puko = pukoRepository.findByTaskId(task.getId()).orElse(new PukoSubmission());
        } else {
            puko = pukoRepository.findByCriterionId(criterion.getId()).orElse(new PukoSubmission());
        }

        puko.setCriterion(criterion);
        puko.setUploadedBy(currentUser);
        puko.setTask(task);
        puko.setPlanText(request.getPlanText());
        if (request.getDoFileUrl() != null && !request.getDoFileUrl().isEmpty()) {
            puko.setDoFileUrl(request.getDoFileUrl());
        }
        puko.setCheckText(request.getCheckText());
        puko.setActText(request.getActText());

        if (task != null) {
            task.setStatus(com.accreditation.core.entity.enums.TaskStatus.COMPLETED);
            taskRepository.save(task);
        }

        puko = pukoRepository.save(puko);
        return mapToResponse(puko);
    }

    @Transactional(readOnly = true)
    public PukoSubmissionResp getPukoByCriterionId(UUID criterionId) {
        PukoSubmission puko = pukoRepository.findByCriterionId(criterionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Puko submission not found"));
        return mapToResponse(puko);
    }

    @Transactional(readOnly = true)
    public PukoSubmissionResp getPukoByTaskId(UUID taskId, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        PukoSubmission puko = pukoRepository.findByTaskId(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Puko submission not found"));

        // 1. Güvenli (Null-Safe) ID Karşılaştırmaları
        boolean isAssigner = task.getAssignedBy() != null &&
                Objects.equals(task.getAssignedBy().getId(), currentUser.getId());

        boolean isAssignee = task.getAssignedTo() != null &&
                Objects.equals(task.getAssignedTo().getId(), currentUser.getId());

        boolean isUploader = puko.getUploadedBy() != null &&
                Objects.equals(puko.getUploadedBy().getId(), currentUser.getId());

        // 2. Rol Kontrolü
        String roleName = (currentUser.getRole() != null) ? currentUser.getRole().getName() : "";
        boolean isSysAdmin = roleName.equals("ROLE_SYS_ADMIN") ||
                roleName.equals("SYS_ADMIN") ||
                roleName.equals("ADMIN");

        // 3. Yetki Guard'ı
        if (!isAssigner && !isAssignee && !isSysAdmin && !isUploader) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu PUKÖ kaydını görme yetkiniz bulunmamaktadır.");
        }

        return mapToResponse(puko);
    }

    private PukoSubmissionResp mapToResponse(PukoSubmission puko) {
        PukoSubmissionResp resp = new PukoSubmissionResp();
        resp.setId(puko.getId());
        resp.setCriterionId(puko.getCriterion().getId());

        // Null koruması eklendi (uploadedBy null olabilir ihtimaline karşı)
        if (puko.getUploadedBy() != null) {
            resp.setUploadedByFullName(puko.getUploadedBy().getFullName());
        }

        if (puko.getTask() != null) {
            resp.setTaskId(puko.getTask().getId());
        }
        resp.setPlanText(puko.getPlanText());
        if (puko.getDoFileUrl() != null && !puko.getDoFileUrl().startsWith("/api")) {
            resp.setDoFileUrl("/api/v1/files/download/" + puko.getDoFileUrl());
        } else {
            resp.setDoFileUrl(puko.getDoFileUrl());
        }
        resp.setCheckText(puko.getCheckText());
        resp.setActText(puko.getActText());
        resp.setCreatedAt(puko.getCreatedAt());
        resp.setUpdatedAt(puko.getUpdatedAt());
        return resp;
    }
}