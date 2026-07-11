package com.accreditation.core.service;

import com.accreditation.core.dto.validation.ValidationRuleCreateRequest;
import com.accreditation.core.dto.validation.ValidationRuleResponse;
import com.accreditation.core.entity.Criterion;
import com.accreditation.core.entity.ValidationRule;
import com.accreditation.core.repository.CriterionRepository;
import com.accreditation.core.repository.ValidationRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ValidationRuleService {

    private final ValidationRuleRepository validationRuleRepository;
    private final CriterionRepository criterionRepository;

    public ValidationRuleResponse createRule(ValidationRuleCreateRequest request) {

        Criterion criterion = criterionRepository.findById(request.criterionId())
                .orElseThrow(() -> new RuntimeException("No criterion found!"));

        ValidationRule rule = new ValidationRule();
        rule.setCriterion(criterion);
        rule.setRuleType(request.ruleType());
        rule.setParameters(request.parameters());
        rule.setErrorMessage(request.errorMessage());

        ValidationRule saved = validationRuleRepository.save(rule);

        return mapToResponse(saved);
    }

    public List<ValidationRuleResponse> getRulesByCriterion(UUID criterionId) {
        return validationRuleRepository.findAllByCriterionId(criterionId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ValidationRuleResponse mapToResponse(ValidationRule rule) {
        return new ValidationRuleResponse(
                rule.getId(),
                rule.getCriterion().getId(),
                rule.getRuleType(),
                rule.getParameters(),
                rule.getErrorMessage());
    }
}
