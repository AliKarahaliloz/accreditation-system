package com.accreditation.core.service;

import com.accreditation.core.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.accreditation.core.entity.User;
import com.accreditation.core.entity.OrganizationUnit;

@Service
@RequiredArgsConstructor
public class RoleService {

    public boolean isRoleAbove(Role assignerRole, Role assigneeRole) {
        if (assignerRole == null || assigneeRole == null) {
            return false;
        }

        if (assignerRole.getId().equals(assigneeRole.getId())) {
            return true;
        }

        Role current = assigneeRole.getParentRole();
        while (current != null) {
            if (current.getId().equals(assignerRole.getId())) {
                return true;
            }
            current = current.getParentRole();
        }

        return false;
    }

    public boolean hasPermission(User assigner, User assignee) {
        if (assigner == null || assignee == null) {
            return false;
        }

        if (assigner.getId().equals(assignee.getId())) {
            return true;
        }

        Role assignerRole = assigner.getRole();
        OrganizationUnit assignerUnit = assigner.getOrganizationUnit();

        String roleName = (assignerRole != null) ? assignerRole.getName() : "";
        boolean isSysAdmin = roleName.equals("ROLE_SYS_ADMIN") || roleName.equals("SYS_ADMIN")
                || roleName.equals("ADMIN");

        if (isSysAdmin) {
            return true;
        }

        Role assigneeRole = assignee.getRole();
        OrganizationUnit assigneeUnit = assignee.getOrganizationUnit();

        System.out.println("--- CHECKING PERMISSIONS ---");
        System.out.println("Assigner: " + assigner.getEmail() + " | Role: " + roleName);
        System.out.println("Assignee: " + assignee.getEmail() + " | Role: "
                + (assigneeRole != null ? assigneeRole.getName() : "null"));

        boolean isRector = roleName.equals("ROLE_RECTOR") || roleName.equals("RECTOR") ||
                roleName.equals("ROLE_VICE_RECTOR") || roleName.equals("VICE_RECTOR");

        if (isRector) {
            System.out.println("Rektör yetkisiyle direkt izin verildi!");
            return true;
        }

        if (!isRoleAbove(assignerRole, assigneeRole)) {
            return false;
        }

        if (assignerUnit == null || assigneeUnit == null) {
            System.out.println("Birimler null olduğu için test amaçlı izin verildi.");
            return true;
        }

        return isUnitInBranch(assignerUnit, assigneeUnit);
    }

    private boolean isUnitInBranch(OrganizationUnit assignerUnit, OrganizationUnit assigneeUnit) {
        if (assignerUnit == null || assigneeUnit == null) {
            return false;
        }

        if (assignerUnit.getId().equals(assigneeUnit.getId())) {
            return true;
        }

        OrganizationUnit currentUnit = assigneeUnit.getParentUnit();
        while (currentUnit != null) {
            if (currentUnit.getId().equals(assignerUnit.getId())) {
                return true;
            }
            currentUnit = currentUnit.getParentUnit();
        }

        return false;
    }
}
