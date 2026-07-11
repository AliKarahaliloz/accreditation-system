package com.accreditation.core.service;

import com.accreditation.core.dto.evaluation.CriterionEvaluationReq;
import com.accreditation.core.dto.evaluation.CriterionEvaluationResp;
import com.accreditation.core.entity.Criterion;
import com.accreditation.core.entity.CriterionEvaluation;
import com.accreditation.core.entity.User;
import com.accreditation.core.repository.CriterionEvaluationRepository;
import com.accreditation.core.repository.CriterionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class EvaluationService {

    private final CriterionEvaluationRepository evaluationRepository;
    private final CriterionRepository criterionRepository;
    private final com.accreditation.core.repository.TaskRepository taskRepository;

    public CriterionEvaluationResp createOrUpdateEvaluation(CriterionEvaluationReq request, User currentUser) {
        UUID criterionId = request.getCriterionId();
        com.accreditation.core.entity.Task task = null;

        if (request.getTaskId() != null) {
            task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
            if (criterionId == null && task.getCriterion() != null) {
                criterionId = task.getCriterion().getId();
            }
        }

        if (criterionId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Criterion ID is required (or must be inferrable from Task)");
        }

        Criterion criterion = criterionRepository.findById(criterionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Criterion not found"));

        CriterionEvaluation evaluation;
        if (task != null) {
            evaluation = evaluationRepository.findByTaskId(task.getId())
                    .orElse(new CriterionEvaluation());
            evaluation.setTask(task);
        } else {
            evaluation = evaluationRepository.findByCriterionId(criterion.getId())
                    .orElse(new CriterionEvaluation());
        }

        evaluation.setCriterion(criterion);
        evaluation.setEvaluator(currentUser);
        evaluation.setScore(request.getScore());
        evaluation.setFeedback(request.getFeedback());

        evaluation = evaluationRepository.save(evaluation);
        return mapToResponse(evaluation);
    }

    @Transactional(readOnly = true)
    public CriterionEvaluationResp getEvaluationByCriterionId(UUID criterionId) {
        CriterionEvaluation evaluation = evaluationRepository.findByCriterionId(criterionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evaluation not found"));
        return mapToResponse(evaluation);
    }

    @Transactional(readOnly = true)
    public CriterionEvaluationResp getEvaluationByTaskId(UUID taskId) {
        CriterionEvaluation evaluation = evaluationRepository.findByTaskId(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evaluation not found"));
        return mapToResponse(evaluation);
    }

    private CriterionEvaluationResp mapToResponse(CriterionEvaluation evaluation) {
        CriterionEvaluationResp resp = new CriterionEvaluationResp();
        resp.setId(evaluation.getId());
        resp.setCriterionId(evaluation.getCriterion().getId());
        if (evaluation.getTask() != null) {
            resp.setTaskId(evaluation.getTask().getId());
        }
        resp.setEvaluatorFullName(evaluation.getEvaluator().getFullName());
        resp.setScore(evaluation.getScore());
        resp.setFeedback(evaluation.getFeedback());
        resp.setEvaluatedAt(evaluation.getEvaluatedAt());
        return resp;
    }
}
