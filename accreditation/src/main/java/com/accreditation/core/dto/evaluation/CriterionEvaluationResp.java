package com.accreditation.core.dto.evaluation;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CriterionEvaluationResp {
    
    private UUID id;
    
    private UUID criterionId;
    
    private UUID taskId;
    
    private String evaluatorFullName;
    
    private Integer score;
    
    private String feedback;
    
    private LocalDateTime evaluatedAt;
}
