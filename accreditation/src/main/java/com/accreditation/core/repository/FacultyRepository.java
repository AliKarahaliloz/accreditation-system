package com.accreditation.core.repository;

import com.accreditation.core.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, UUID> {
    List<Faculty> findAllByTenantId(UUID tenantId);
}