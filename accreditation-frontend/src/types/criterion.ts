export interface CriterionTreeResponse {
  id: string;
  code: string;
  title: string;
  description: string;
  subCriteria: CriterionTreeResponse[];
}

export interface CriterionResponse {
  id: string;
  code: string;
  title: string;
  description: string;
  subCriteria: CriterionResponse[];
}
