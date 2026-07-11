package com.accreditation.core.service;

import com.accreditation.core.dto.task.TaskRequest;
import com.accreditation.core.dto.task.TaskResponse;
import com.accreditation.core.entity.Criterion;
import com.accreditation.core.entity.Task;
import com.accreditation.core.entity.User;
import com.accreditation.core.entity.enums.TaskStatus;
import com.accreditation.core.repository.CriterionEvaluationRepository;
import com.accreditation.core.repository.CriterionRepository;
import com.accreditation.core.repository.TaskRepository;
import com.accreditation.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CriterionRepository criterionRepository;
    private final CriterionEvaluationRepository evaluationRepository;
    private final com.accreditation.core.repository.PukoSubmissionRepository pukoRepository;
    private final RoleService roleService;
    private final FileStorageService fileStorageService;

    public TaskResponse createTask(TaskRequest request, User currentUser) {
        User assignedTo = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigned user not found"));

        if (!roleService.hasPermission(currentUser, assignedTo)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You don't have permission to assign tasks to this user.");
        }

        java.util.List<UUID> criterionIds = request.getCriterionIds();
        if ((criterionIds == null || criterionIds.isEmpty()) && request.getCriterionId() != null) {
            criterionIds = java.util.List.of(request.getCriterionId());
        }

        if (criterionIds == null || criterionIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Görev atarken en az bir ölçüt seçimi zorunludur.");
        }

        Task firstSavedTask = null;
        for (UUID criterionId : criterionIds) {
            Criterion criterion = criterionRepository.findById(criterionId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Criterion not found: " + criterionId));

            if (criterionRepository.existsByParentCriterionId(criterionId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Sadece alt (yaprak) ölçütlere görev atanabilir. Üst başlık seçilemez: " + criterion.getCode());
            }

            Task task = new Task();
            task.setTitle(request.getTitle());
            task.setDescription(request.getDescription());
            task.setDeadline(request.getDeadline());
            task.setAssignedBy(currentUser);
            task.setAssignedTo(assignedTo);
            task.setCriterion(criterion);
            task.setDocumentUrl(request.getDocumentUrl());
            task.setTenant(currentUser.getTenant());

            task = taskRepository.save(task);
            if (firstSavedTask == null) {
                firstSavedTask = task;
            }
        }

        return mapToResponse(firstSavedTask);
    }

    public List<TaskResponse> getMyTasks(User currentUser) {
        return taskRepository.findByAssignedTo(currentUser).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getTasksAssignedByMe(User currentUser) {
        return taskRepository.findByAssignedBy(currentUser).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse updateTaskStatus(UUID taskId, TaskStatus status, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        boolean isAssignedTo = task.getAssignedTo().getId().toString().equals(currentUser.getId().toString());
        boolean isAssigner = task.getAssignedBy().getId().toString().equals(currentUser.getId().toString());
        String roleName = (currentUser.getRole() != null) ? currentUser.getRole().getName() : "";
        boolean isSysAdmin = roleName.equals("ROLE_SYS_ADMIN") || roleName.equals("SYS_ADMIN")
                || roleName.equals("ADMIN");

        if (!isAssignedTo && !isAssigner && !isSysAdmin
                && !roleService.hasPermission(currentUser, task.getAssignedTo())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to update this task.");
        }

        task.setStatus(status);
        task = taskRepository.save(task);
        return mapToResponse(task);
    }

    public TaskResponse uploadProof(UUID taskId, MultipartFile file, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        if (!task.getAssignedTo().getId().toString().equals(currentUser.getId().toString())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the assigned user can upload proof.");
        }

        String fileUrl = fileStorageService.storeFile(file);

        if (!fileUrl.startsWith("/api")) {
            fileUrl = "/api/v1/files/download/" + fileUrl;
        }
        task.setDocumentUrl(fileUrl);
        task.setStatus(TaskStatus.COMPLETED);
        task = taskRepository.save(task);

        return mapToResponse(task);
    }

    public TaskResponse publishTask(UUID taskId, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        // currentUser controller'dan gelen detached entity olabilir.
        // Lazy ilişkilerin (role, organizationUnit) doğru yüklenmesi için
        // DB'den yeniden managed entity olarak çekiyoruz.
        User managedCurrentUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Current user not found"));

        boolean isAssigner = task.getAssignedBy() != null &&
                task.getAssignedBy().getId().equals(managedCurrentUser.getId());

        String roleName = (managedCurrentUser.getRole() != null) ? managedCurrentUser.getRole().getName() : "";
        boolean isSysAdmin = roleName.equals("ROLE_SYS_ADMIN") || roleName.equals("SYS_ADMIN")
                || roleName.equals("ADMIN");

        System.out.println("=== PUBLISH TASK DEBUG ===");
        System.out.println("Task ID: " + taskId);
        System.out.println("Current User: " + managedCurrentUser.getEmail() + " | Role: " + roleName);
        System.out.println(
                "Task AssignedBy: " + (task.getAssignedBy() != null ? task.getAssignedBy().getEmail() : "null"));
        System.out.println(
                "Task AssignedTo: " + (task.getAssignedTo() != null ? task.getAssignedTo().getEmail() : "null"));
        System.out.println("isAssigner: " + isAssigner + " | isSysAdmin: " + isSysAdmin);

        boolean hasPermissionOverAssignee = roleService.hasPermission(managedCurrentUser, task.getAssignedTo());
        boolean hasPermissionOverAssigner = roleService.hasPermission(managedCurrentUser, task.getAssignedBy());

        System.out.println("hasPermissionOverAssignee: " + hasPermissionOverAssignee);
        System.out.println("hasPermissionOverAssigner: " + hasPermissionOverAssigner);

        if (!isAssigner && !isSysAdmin && !hasPermissionOverAssignee && !hasPermissionOverAssigner) {
            System.out.println("FORBIDDEN: Hiçbir yetki koşulu sağlanamadı!");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Bu görevi yayınlama yetkiniz bulunmuyor. (Yalnızca görevi atayan, sistem yöneticisi veya yetkili amirler yayınlayabilir)");
        }

        if (task.getStatus() != TaskStatus.COMPLETED && task.getStatus() != TaskStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Yalnızca tamamlanmış görevler yayınlanabilir. Mevcut durum: " + task.getStatus());
        }

        // Değerlendirme yapılmış mı kontrol et
        boolean hasEvaluation = evaluationRepository.findByTaskId(taskId).isPresent();
        System.out.println("hasEvaluation: " + hasEvaluation);
        if (!hasEvaluation) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Bu görev yayınlanmadan önce değerlendirilmelidir.");
        }

        task.setStatus(TaskStatus.PUBLISHED);
        task = taskRepository.save(task);
        System.out.println("=== PUBLISH SUCCESSFUL ===");

        return mapToResponse(task);
    }

    public TaskResponse unpublishTask(UUID taskId, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        User managedCurrentUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Current user not found"));

        boolean isAssigner = task.getAssignedBy() != null &&
                task.getAssignedBy().getId().equals(managedCurrentUser.getId());

        String roleName = (managedCurrentUser.getRole() != null) ? managedCurrentUser.getRole().getName() : "";
        boolean isSysAdmin = roleName.equals("ROLE_SYS_ADMIN") || roleName.equals("SYS_ADMIN")
                || roleName.equals("ADMIN");
        boolean hasPermissionOverAssignee = roleService.hasPermission(managedCurrentUser, task.getAssignedTo());

        if (!isAssigner && !isSysAdmin && !hasPermissionOverAssignee) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Bu görevi geri alma yetkiniz bulunmuyor.");
        }

        if (task.getStatus() != TaskStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Yalnızca yayınlanmış görevler geri alınabilir.");
        }

        task.setStatus(TaskStatus.COMPLETED);
        task = taskRepository.save(task);

        return mapToResponse(task);
    }

    public List<TaskResponse> getPublishedTasks(User currentUser) {
        return taskRepository.findByTenantAndStatus(currentUser.getTenant(), TaskStatus.PUBLISHED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getPublishedTasksByCriterionCode(String code, User currentUser) {
        Criterion criterion = criterionRepository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Criterion not found"));

        return taskRepository.findByCriterionAndStatus(criterion, TaskStatus.PUBLISHED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TaskResponse mapToResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setDeadline(task.getDeadline());
        response.setStatus(task.getStatus());
        response.setAssignedByName(task.getAssignedBy().getFullName());
        response.setAssignedToName(task.getAssignedTo().getFullName());
        if (task.getCriterion() != null) {
            response.setCriterionCode(task.getCriterion().getCode());
            response.setCriterionTitle(task.getCriterion().getCode() + " - " + task.getCriterion().getTitle());
            response.setCriterionDescription(task.getCriterion().getDescription());
            response.setCriterionId(task.getCriterion().getId());
        }
        if (task.getDocumentUrl() != null && !task.getDocumentUrl().startsWith("/api")) {
            response.setDocumentUrl("/api/v1/files/download/" + task.getDocumentUrl());
        } else {
            response.setDocumentUrl(task.getDocumentUrl());
        }

        // Fetch PUKO details if available
        pukoRepository.findByTaskId(task.getId()).ifPresent(puko -> {
            response.setPlanText(puko.getPlanText());
            response.setCheckText(puko.getCheckText());
            response.setActText(puko.getActText());
            if (puko.getDoFileUrl() != null) {
                if (!puko.getDoFileUrl().startsWith("/api")) {
                    response.setDocumentUrl("/api/v1/files/download/" + puko.getDoFileUrl());
                } else {
                    response.setDocumentUrl(puko.getDoFileUrl());
                }
            }
            if (puko.getUpdatedAt() != null) {
                response.setCompletedAt(puko.getUpdatedAt().toString());
            } else {
                response.setCompletedAt(puko.getCreatedAt().toString());
            }
        });

        response.setHasEvaluation(evaluationRepository.findByTaskId(task.getId()).isPresent());

        return response;
    }
}
