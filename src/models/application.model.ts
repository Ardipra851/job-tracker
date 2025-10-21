export interface Application {
  id: number;
  companyName: string;
  position: string;
  status: string;
  appliedAt: Date;
  notes?: string;
  cvFilePath: string;
}

export interface GetAllApplications {
  id: number;
  companyName: string;
  position: string;
  status: string;
  appliedAt: Date;
}

export interface ApplicationRequest {
  companyName: string;
  position: string;
  status: string;
  appliedAt: Date;
  notes?: string;
}

export interface ApplicationUpdateRequest extends ApplicationRequest {
  id: number;
}

export interface GetByIdRequest {
  id: number;
}

export interface ApplicationFilters {
  status?: string;
  position?: string;
  appliedAt?: string;
}

export const toApplicationResponse = (
  application: Application
): Application => {
  return {
    id: application.id,
    companyName: application.companyName,
    position: application.position,
    status: application.status,
    appliedAt: application.appliedAt,
    notes: application.notes || "",
    cvFilePath: application.cvFilePath,
  };
};
