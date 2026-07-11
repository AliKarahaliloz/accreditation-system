package com.accreditation.core.controller;

import com.accreditation.core.dto.task.TaskRequest;
import com.accreditation.core.dto.task.TaskResponse;
import com.accreditation.core.entity.User;
import com.accreditation.core.entity.enums.TaskStatus;
import com.accreditation.core.security.CustomUserDetails;
import com.accreditation.core.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @RequestBody TaskRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User currentUser = userDetails.getUser();
        TaskResponse response = taskService.createTask(request, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-tasks")
    public ResponseEntity<List<TaskResponse>> getMyTasks(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User currentUser = userDetails.getUser();
        List<TaskResponse> responses = taskService.getMyTasks(currentUser);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/assigned-by-me")
    public ResponseEntity<List<TaskResponse>> getTasksAssignedByMe(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User currentUser = userDetails.getUser();
        List<TaskResponse> responses = taskService.getTasksAssignedByMe(currentUser);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{taskId}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable UUID taskId,
            @RequestParam TaskStatus status,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User currentUser = userDetails.getUser();
        TaskResponse response = taskService.updateTaskStatus(taskId, status, currentUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{taskId}/upload-proof")
    public ResponseEntity<TaskResponse> uploadProof(
            @PathVariable UUID taskId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User currentUser = userDetails.getUser();
        TaskResponse response = taskService.uploadProof(taskId, file, currentUser);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{taskId}/publish")
    public ResponseEntity<TaskResponse> publishTask(
            @PathVariable UUID taskId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        User currentUser = userDetails.getUser();
        TaskResponse response = taskService.publishTask(taskId, currentUser);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{taskId}/unpublish")
    public ResponseEntity<TaskResponse> unpublishTask(
            @PathVariable UUID taskId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        User currentUser = userDetails.getUser();
        TaskResponse response = taskService.unpublishTask(taskId, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/published")
    public ResponseEntity<List<TaskResponse>> getPublishedTasks(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        User currentUser = userDetails.getUser();
        List<TaskResponse> responses = taskService.getPublishedTasks(currentUser);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/criterion/{code}/published")
    public ResponseEntity<List<TaskResponse>> getPublishedTasksByCriterionCode(
            @PathVariable String code,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        User currentUser = userDetails.getUser();
        List<TaskResponse> responses = taskService.getPublishedTasksByCriterionCode(code, currentUser);
        return ResponseEntity.ok(responses);
    }
}
