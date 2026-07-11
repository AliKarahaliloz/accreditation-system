package com.accreditation.core.repository;

import com.accreditation.core.entity.Criterion;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CriterionRepository extends JpaRepository<Criterion, UUID> {
    Optional<Criterion> findByCode(String code);

    @EntityGraph(attributePaths = { "subCriteria" })
    List<Criterion> findByParentCriterionIsNullOrderByCodeAsc();

    List<Criterion> findAllByOrderByCodeAsc();

    boolean existsByParentCriterionId(UUID parentCriterionId);
}
