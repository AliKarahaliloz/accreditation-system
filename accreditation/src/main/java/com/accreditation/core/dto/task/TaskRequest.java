package com.accreditation.core.dto.task;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TaskRequest {
    private String title;
    private String description;
    private LocalDateTime deadline;
    private UUID assignedToId;
    private UUID criterionId;
    private java.util.List<UUID> criterionIds;
    private String documentUrl;
}
