package com.accreditation.core.dto.puko;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PukoSubmissionResp {
    
    private UUID id;
    
    private UUID criterionId;
    
    private String uploadedByFullName;
    
    private UUID taskId;
    
    private String planText;
    
    private String doFileUrl;
    
    private String checkText;
    
    private String actText;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
