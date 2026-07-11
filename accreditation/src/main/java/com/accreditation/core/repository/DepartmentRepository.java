package com.accreditation.core.repository;

import com.accreditation.core.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    List<Department> findAllByFacultyId(UUID facultyId);

    List<Department> findAllByTenantId(UUID tenantId);
}