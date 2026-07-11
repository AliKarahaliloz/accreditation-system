package com.accreditation.core.dto.evidence;

import java.time.LocalDateTime;
import java.util.UUID;

public record EvidenceResponse(
                UUID id,
                String fileName,
                String filePath,
                LocalDateTime uploadedAt) {
}
