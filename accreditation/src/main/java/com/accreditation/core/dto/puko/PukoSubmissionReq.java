package com.accreditation.core.dto.puko;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PukoSubmissionReq {
    
    private UUID criterionId;

    private UUID taskId;
    
    private String planText;
    
    private String doFileUrl;
    
    private String checkText;
    
    private String actText;
}
