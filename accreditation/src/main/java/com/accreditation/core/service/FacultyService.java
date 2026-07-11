package com.accreditation.core.service;

import com.accreditation.core.dto.faculty.FacultyResponse;
import com.accreditation.core.entity.Faculty;
import com.accreditation.core.entity.Tenant;
import com.accreditation.core.repository.FacultyRepository;
import com.accreditation.core.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacultyService {

        private final FacultyRepository facultyRepository;
        private final TenantRepository tenantRepository;

        public FacultyResponse createFaculty(String name, String directorName, UUID tenantId) {
                Tenant tenant = tenantRepository.findById(tenantId)
                                .orElseThrow(() -> new RuntimeException("Üniversite bulunamadı!"));

                Faculty faculty = new Faculty();
                faculty.setName(name);
                faculty.setDirectorName(directorName);
                faculty.setTenant(tenant);

                Faculty savedFaculty = facultyRepository.save(faculty);

                return new FacultyResponse(
                                savedFaculty.getId(),
                                savedFaculty.getName(),
                                savedFaculty.getDirectorName(),
                                tenant.getId());
        }

        public List<FacultyResponse> getAllFacultiesByTenant(UUID tenantId) {
                List<Faculty> faculties = facultyRepository.findAllByTenantId(tenantId);

                return faculties.stream()
                                .map(f -> new FacultyResponse(
                                                f.getId(),
                                                f.getName(),
                                                f.getDirectorName(),
                                                f.getTenant().getId()))
                                .collect(Collectors.toList());
        }
}
