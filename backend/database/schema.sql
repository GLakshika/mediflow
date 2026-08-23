-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role character varying NOT NULL CHECK (role::text = ANY (ARRAY['PATIENT'::character varying, 'DOCTOR'::character varying, 'HOSPITAL_ADMIN'::character varying]::text[])),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.hospitals (
  name character varying NOT NULL,
  address text NOT NULL,
  latitude numeric,
  longitude numeric,
  phone character varying,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  status character varying DEFAULT 'ACTIVE'::character varying CHECK (status::text = ANY (ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying]::text[])),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT hospitals_pkey PRIMARY KEY (id)
);
CREATE TABLE public.departments (
  hospital_id uuid NOT NULL,
  name character varying NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  status character varying DEFAULT 'ACTIVE'::character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT departments_pkey PRIMARY KEY (id),
  CONSTRAINT departments_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id)
);
CREATE TABLE public.doctors (
  user_id uuid NOT NULL,
  hospital_id uuid NOT NULL,
  department_id uuid,
  specialization character varying,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  available boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT doctors_pkey PRIMARY KEY (id),
  CONSTRAINT doctors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT doctors_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id),
  CONSTRAINT doctors_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE TABLE public.appointments (
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  hospital_id uuid NOT NULL,
  appointment_date date NOT NULL,
  appointment_time time without time zone NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  status character varying DEFAULT 'BOOKED'::character varying CHECK (status::text = ANY (ARRAY['BOOKED'::character varying, 'CANCELLED'::character varying, 'COMPLETED'::character varying, 'NO_SHOW'::character varying]::text[])),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id),
  CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id),
  CONSTRAINT appointments_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id)
);
CREATE TABLE public.queues (
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  appointment_id uuid,
  queue_number integer NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  status character varying DEFAULT 'WAITING'::character varying CHECK (status::text = ANY (ARRAY['WAITING'::character varying, 'CALLED'::character varying, 'COMPLETED'::character varying, 'SKIPPED'::character varying]::text[])),
  joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT queues_pkey PRIMARY KEY (id),
  CONSTRAINT queues_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id),
  CONSTRAINT queues_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id),
  CONSTRAINT queues_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id)
);
CREATE TABLE public.emergency_capacity (
  hospital_id uuid NOT NULL UNIQUE,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  available_beds integer DEFAULT 0,
  emergency_queue integer DEFAULT 0,
  doctors_available integer DEFAULT 0,
  status character varying DEFAULT 'AVAILABLE'::character varying CHECK (status::text = ANY (ARRAY['AVAILABLE'::character varying, 'LIMITED'::character varying, 'FULL'::character varying]::text[])),
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT emergency_capacity_pkey PRIMARY KEY (id),
  CONSTRAINT emergency_capacity_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id)
);
CREATE TABLE public.notifications (
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  type character varying,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  is_read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.hospital_admins (
  user_id uuid NOT NULL UNIQUE,
  hospital_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT hospital_admins_pkey PRIMARY KEY (id),
  CONSTRAINT hospital_admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT hospital_admins_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id)
);