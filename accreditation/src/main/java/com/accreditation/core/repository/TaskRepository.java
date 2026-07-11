package com.accreditation.core.repository;

import com.accreditation.core.entity.Task;
import com.accreditation.core.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByAssignedTo(User assignedTo);

    List<Task> findByAssignedBy(User assignedBy);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT t.criterion.id FROM Task t WHERE t.assignedTo = :user AND t.criterion IS NOT NULL")
    List<UUID> findCriterionIdsByAssignedTo(@org.springframework.data.repository.query.Param("user") User user);

    List<Task> findByTenantAndStatus(com.accreditation.core.entity.Tenant tenant, com.accreditation.core.entity.enums.TaskStatus status);

    List<Task> findByCriterionAndStatus(com.accreditation.core.entity.Criterion criterion, com.accreditation.core.entity.enums.TaskStatus status);
}