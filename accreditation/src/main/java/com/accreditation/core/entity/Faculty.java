package com.accreditation.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "faculties")
@Getter
@Setter

public class Faculty {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    // Which University is it connected to?
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private String name;

    @Column(name = "dean_name")
    private String directorName;

    // Faculty Departments (Bidirectional Relationship)
    @OneToMany(mappedBy = "faculty", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Department> departments;
}