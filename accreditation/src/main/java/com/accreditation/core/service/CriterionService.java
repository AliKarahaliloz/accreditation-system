package com.accreditation.core.service;

import com.accreditation.core.dto.criterion.CriterionCreateRequest;
import com.accreditation.core.dto.criterion.CriterionResponse;
import com.accreditation.core.dto.criterion.CriterionTreeResponse;
import com.accreditation.core.entity.Criterion;
import com.accreditation.core.repository.CriterionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CriterionService {

    private final CriterionRepository criterionRepository;
    private final com.accreditation.core.repository.TaskRepository taskRepository;

    @Transactional
    public CriterionResponse createCriterion(CriterionCreateRequest request) {
        if (criterionRepository.findByCode(request.code()).isPresent()) {
            throw new RuntimeException("Criterion with code " + request.code() + " already exists!");
        }

        Criterion criterion = new Criterion();
        criterion.setCode(request.code());
        criterion.setTitle(request.title());
        criterion.setDescription(request.description());

        if (request.parentCriterionId() != null) {
            Criterion parent = criterionRepository.findById(request.parentCriterionId())
                    .orElseThrow(() -> new RuntimeException("Parent criterion not found!"));
            criterion.setParentCriterion(parent);
        }

        Criterion savedCriterion = criterionRepository.save(criterion);
        return mapToResponse(savedCriterion);
    }

    public List<CriterionTreeResponse> getCriteriaTree(com.accreditation.core.entity.User currentUser) {
        // Tüm kriterleri tek bir sorguyla çekiyoruz (N+1 çözümünün başlangıcı)
        List<Criterion> allCriteria = criterionRepository.findAllByOrderByCodeAsc();

        // Kriterleri ID'ye göre bir Map'e koyuyoruz
        java.util.Map<UUID, CriterionTreeResponse> nodeMap = new java.util.HashMap<>();
        for (Criterion c : allCriteria) {
            nodeMap.put(c.getId(), new CriterionTreeResponse(
                    c.getId(), c.getCode(), c.getTitle(), c.getDescription(), new java.util.ArrayList<>()));
        }

        List<CriterionTreeResponse> roots = new java.util.ArrayList<>();
        for (Criterion c : allCriteria) {
            CriterionTreeResponse current = nodeMap.get(c.getId());
            if (c.getParentCriterion() == null) {
                roots.add(current);
            } else {
                CriterionTreeResponse parent = nodeMap.get(c.getParentCriterion().getId());
                if (parent != null) {
                    parent.subCriteria().add(current);
                }
            }
        }

        if (currentUser.getRole() == null)
            return roots;

        String roleName = currentUser.getRole().getName();
        boolean canSeeAll = roleName.equals("ROLE_SYS_ADMIN") ||
                roleName.equals("ROLE_RECTOR") ||
                roleName.equals("ROLE_VICE_RECTOR") ||
                roleName.equals("ROLE_DIRECTOR");

        if (canSeeAll)
            return roots;

        // Yetki bazlı filtreleme
        List<java.util.UUID> assignedIds = taskRepository.findCriterionIdsByAssignedTo(currentUser);
        return roots.stream()
                .map(root -> filterTreeResponse(root, assignedIds))
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    private CriterionTreeResponse filterTreeResponse(CriterionTreeResponse node, List<java.util.UUID> assignedIds) {
        List<CriterionTreeResponse> filteredSubs = new java.util.ArrayList<>();
        for (CriterionTreeResponse sub : node.subCriteria()) {
            CriterionTreeResponse filteredSub = filterTreeResponse(sub, assignedIds);
            if (filteredSub != null)
                filteredSubs.add(filteredSub);
        }

        if (assignedIds.contains(node.id()) || !filteredSubs.isEmpty()) {
            return new CriterionTreeResponse(node.id(), node.code(), node.title(), node.description(), filteredSubs);
        }
        return null;
    }

    public List<CriterionResponse> getFlatCriteria() {
        return criterionRepository.findAllByOrderByCodeAsc().stream()
                .map(c -> new CriterionResponse(c.getId(), c.getCode(), c.getTitle(), c.getDescription(), List.of()))
                .collect(Collectors.toList());
    }

    public CriterionResponse getCriterionByCode(String code) {
        Criterion criterion = criterionRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Criterion not found with code: " + code));
        return new CriterionResponse(criterion.getId(), criterion.getCode(), criterion.getTitle(),
                criterion.getDescription(), List.of());
    }

    private CriterionResponse mapToResponse(Criterion criterion) {
        // Recursive mapping'den kaçınıyoruz (N+1'i engellemek için)
        return new CriterionResponse(
                criterion.getId(),
                criterion.getCode(),
                criterion.getTitle(),
                criterion.getDescription(),
                List.of()); // Detay görünümünde alt kriterleri şimdilik boş dönüyoruz veya gerekirse
                            // düzleştiriyoruz
    }
}
