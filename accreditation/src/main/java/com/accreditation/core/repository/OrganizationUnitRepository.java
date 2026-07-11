package com.accreditation.core.repository;

import com.accreditation.core.entity.OrganizationUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationUnitRepository extends JpaRepository<OrganizationUnit, UUID> {
    Optional<OrganizationUnit> findByName(String name);
}
