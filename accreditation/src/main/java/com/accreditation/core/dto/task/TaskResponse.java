package com.accreditation.core.dto.task;

import com.accreditation.core.entity.enums.TaskStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TaskResponse {
    private UUID id;
    private String title;
    private String description;
    private LocalDateTime deadline;
    private TaskStatus status;
    private String assignedByName;
    private String assignedToName;
    private String criterionCode; 
    private String criterionTitle;
    private String criterionDescription;
    private UUID criterionId;
    private String documentUrl;
    private String planText;
    private String checkText;
    private String actText;
    private String completedAt;
    private boolean hasEvaluation;
}
