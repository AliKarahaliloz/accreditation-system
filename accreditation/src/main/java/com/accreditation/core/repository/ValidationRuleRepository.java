package com.accreditation.core.repository;

import com.accreditation.core.entity.ValidationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ValidationRuleRepository extends JpaRepository<ValidationRule, UUID> {
    List<ValidationRule> findAllByCriterionId(UUID criterionId);
}