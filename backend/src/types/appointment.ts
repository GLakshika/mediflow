export interface CreateAppointmentRequest {
  doctor_id: string;
  hospital_id: string;
  appointment_date: string;
  appointment_time: string;
}