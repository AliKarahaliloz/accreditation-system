package com.accreditation.core.repository;

import com.accreditation.core.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    @EntityGraph(attributePaths = { "role", "department", "department.faculty", "tenant" })
    List<User> findAllByTenantId(UUID tenantId);

    @EntityGraph(attributePaths = { "role", "department", "department.faculty", "tenant" })
    List<User> findAllByDepartmentId(UUID departmentId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "role", "tenant" })
    Optional<User> findByEmail(String email);
}
