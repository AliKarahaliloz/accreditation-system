package com.accreditation.core.repository;

import com.accreditation.core.entity.PukoSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PukoSubmissionRepository extends JpaRepository<PukoSubmission, UUID> {
    Optional<PukoSubmission> findByCriterionId(UUID criterionId);
    Optional<PukoSubmission> findByTaskId(UUID taskId);
}
