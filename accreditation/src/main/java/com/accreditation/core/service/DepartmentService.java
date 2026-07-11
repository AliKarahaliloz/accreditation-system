package com.accreditation.core.service;

import com.accreditation.core.dto.department.DepartmentResponse;
import com.accreditation.core.entity.Department;
import com.accreditation.core.entity.Faculty;
import com.accreditation.core.repository.DepartmentRepository;
import com.accreditation.core.repository.FacultyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

        private final DepartmentRepository departmentRepository;
        private final FacultyRepository facultyRepository;

        public DepartmentResponse createDepartment(String name, String headOfDepartment, UUID facultyId) {
                Faculty faculty = facultyRepository.findById(facultyId)
                                .orElseThrow(() -> new RuntimeException("Meslek Yüksekokulu bulunamadı!"));

                Department department = new Department();
                department.setName(name);
                department.setHeadOfDepartment(headOfDepartment);
                department.setFaculty(faculty);
                department.setTenant(faculty.getTenant());

                Department savedDepartment = departmentRepository.save(department);

                return new DepartmentResponse(
                                savedDepartment.getId(),
                                savedDepartment.getName(),
                                savedDepartment.getHeadOfDepartment(),
                                faculty.getId());
        }

        public List<DepartmentResponse> getAllDepartmentsByFaculty(UUID facultyId) {
                List<Department> departments = departmentRepository.findAllByFacultyId(facultyId);

                return departments.stream()
                                .map(d -> new DepartmentResponse(
                                                d.getId(),
                                                d.getName(),
                                                d.getHeadOfDepartment(),
                                                d.getFaculty().getId()))
                                .collect(Collectors.toList());
        }

        public List<DepartmentResponse> getAllDepartmentsByTenant(UUID tenantId) {
                List<Department> departments = departmentRepository.findAllByTenantId(tenantId);

                return departments.stream()
                                .map(d -> new DepartmentResponse(
                                                d.getId(),
                                                d.getName(),
                                                d.getHeadOfDepartment(),
                                                d.getFaculty().getId()))
                                .collect(Collectors.toList());
        }
}
