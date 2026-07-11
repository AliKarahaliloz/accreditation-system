package com.accreditation.core.repository;

import com.accreditation.core.entity.CriterionEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CriterionEvaluationRepository extends JpaRepository<CriterionEvaluation, UUID> {
    Optional<CriterionEvaluation> findByCriterionId(UUID criterionId);
    Optional<CriterionEvaluation> findByTaskId(UUID taskId);
}
