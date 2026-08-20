export type UserRole =
  | "PATIENT"
  | "DOCTOR"
  | "HOSPITAL_ADMIN";

export interface AuthRequest {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}