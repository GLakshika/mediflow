# MediFlow — Smart Hospital Management System

MediFlow is a smart hospital management system designed to connect **patients, doctors, and hospital administrators** through a centralized platform.

The system supports hospital discovery, appointment booking, patient queues, doctor management, emergency information, and notifications.

---

## 📌 Project Overview

MediFlow aims to simplify hospital operations and improve the patient experience by providing a digital platform for managing:

* Hospitals
* Departments
* Doctors
* Patients
* Appointments
* Patient queues
* Emergency services
* Notifications
* Hospital administration

The system consists of a **web application**, **mobile application**, and **backend API** connected to a PostgreSQL database.

---

## 👥 User Roles

### 1. Patient

Patients can:

* Register and log in
* Find hospitals
* View hospital departments
* View available doctors
* Book appointments
* View their appointments
* Join/view the patient queue
* Track queue status
* View emergency information
* View notifications

### 2. Doctor

Doctors can:

* Log in securely
* View today's appointments
* View patient information
* Update appointment status
* View their patient queue
* Call the next patient
* Complete consultations
* Skip patients
* Track queue status

### 3. Hospital Admin

Hospital administrators can:

* Manage hospital departments
* Add doctors
* View doctors
* Edit doctor information
* Enable/disable doctors
* Assign doctors to departments
* Manage hospital-related information

---

# 🏗️ System Architecture

The project follows a **client-server architecture**.

```text
                    ┌─────────────────────┐
                    │     Patient Web     │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               │
                    ┌──────────▼──────────┐
                    │      Backend API    │
                    │   Node.js/Express   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    PostgreSQL DB    │
                    └─────────────────────┘
                               ▲
                               │
                    ┌──────────┴──────────┐
                    │                     │
             Doctor Web App        Mobile Application
```

---

# 🛠️ Technology Stack

## Frontend

* React
* TypeScript
* Vite
* React Router
* Axios
* HTML
* CSS

## Backend

* Node.js
* Express.js
* TypeScript
* REST APIs
* JWT Authentication
* bcrypt

## Database

* PostgreSQL

## Development Tools

* Git
* GitHub
* VS Code
* Postman
* npm

---

# 📂 Project Structure

```text
mediflow/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── routes/
│   │   └── App.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── server.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/
│   └── ...
│
├── database/
│   ├── schema.sql
│   └── migrations/
│
└── README.md
```

---

# 🗄️ Database Schema

MediFlow uses **PostgreSQL** as the main database.

The database contains entities for users, hospitals, departments, doctors, appointments, queues, and other hospital-related information.

A simplified relationship is:

```text
Users
 │
 ├───────────────┐
 │               │
 ▼               ▼
Patients       Doctors
                 │
                 ▼
            Departments
                 │
                 ▼
              Hospitals

Patients
   │
   ▼
Appointments
   │
   ▼
Queue
   │
   ▼
Doctor
```

## Main Tables

### `users`

Stores authentication and basic user information.

```text
id
name
email
password_hash
role
created_at
updated_at
```

### `hospitals`

Stores hospital information.

```text
id
name
address
...
```

### `departments`

Stores departments belonging to hospitals.

```text
id
hospital_id
name
status
...
```

### `doctors`

Stores doctor profiles.

```text
id
user_id
hospital_id
department_id
specialization
available
...
```

### `appointments`

Stores patient appointments.

```text
id
patient_id
doctor_id
hospital_id
appointment_date
appointment_time
status
...
```

### `queues`

Stores patient queue information.

```text
id
patient_id
doctor_id
appointment_id
queue_number
status
joined_at
...
```

### Queue Status

```text
WAITING
   ↓
CALLED
   ↓
COMPLETED
```

or

```text
WAITING
   ↓
SKIPPED
```

---

# 🔐 Authentication

MediFlow uses **JWT-based authentication**.

The general authentication flow is:

```text
User
 │
 │ Login
 ▼
POST /auth/login
 │
 ▼
Backend validates credentials
 │
 ▼
JWT generated
 │
 ▼
Frontend stores token
 │
 ▼
Token sent with API requests
 │
 ▼
Authentication Middleware
 │
 ▼
Protected Controller
```

The token is stored on the client side and sent with protected API requests.

---

# 🔑 Role-Based Access Control

Different users have different permissions.

```text
PATIENT
   │
   ├── Hospitals
   ├── Appointments
   ├── Queue
   ├── Emergency
   └── Notifications


DOCTOR
   │
   ├── Appointments
   └── Patient Queue


HOSPITAL_ADMIN
   │
   ├── Departments
   └── Doctors
```

The backend also validates the user's role before allowing access to protected resources.

---

# 🔄 Main Workflow

## Patient Workflow

```text
Register
   ↓
Login
   ↓
Patient Dashboard
   ↓
Find Hospital
   ↓
Select Hospital
   ↓
Select Department
   ↓
Select Doctor
   ↓
Book Appointment
   ↓
Join/View Queue
   ↓
Wait for Doctor
   ↓
Doctor Calls Patient
   ↓
Consultation
   ↓
Appointment Completed
```

---

# 👨‍⚕️ Doctor Workflow

```text
Doctor Login
      ↓
Doctor Dashboard
      ↓
View Appointments
      ↓
View Patient Queue
      ↓
Call Next Patient
      ↓
Patient Status = CALLED
      ↓
Consultation
      ↓
Complete
      ↓
Queue = COMPLETED
      ↓
Appointment = COMPLETED
```

If the patient needs to be skipped:

```text
WAITING
   ↓
CALLED
   ↓
SKIPPED
```

---

# 🏥 Hospital Admin Workflow

```text
Admin Login
     ↓
Admin Dashboard
     ↓
Manage Departments
     ↓
Create / Update Departments
     ↓
Manage Doctors
     ↓
Add Doctor
     ↓
Assign Department
     ↓
Edit Doctor
     ↓
Enable / Disable Doctor
```

---

# 📡 REST API

The frontend communicates with the backend through REST APIs.

Examples:

### Authentication

```http
POST /auth/login
POST /auth/register
```

### Hospitals

```http
GET /hospitals
GET /hospitals/:id
```

### Departments

```http
GET /departments/admin
POST /departments/admin
PUT /departments/admin/:id
```

### Doctors

```http
GET /doctors/admin
POST /doctors/admin
PUT /doctors/admin/:id
PATCH /doctors/admin/:id/status
```

### Appointments

```http
GET /appointments/doctor
GET /appointments/my
PATCH /appointments/doctor/:id/status
```

### Queue

```http
GET /queues/my
GET /queues/doctor
PATCH /queues/doctor/:id/call
PATCH /queues/doctor/:id/complete
PATCH /queues/doctor/:id/skip
```

---

# 🔄 Queue Management

The queue system is one of the main features of MediFlow.

A patient can see:

* Queue number
* Doctor
* Hospital
* Appointment date
* Appointment time
* Current queue status

The doctor can:

* View waiting patients
* Call the next patient
* Complete the consultation
* Skip a patient

When a doctor completes a queue entry, the backend updates both:

```text
queues.status = COMPLETED
```

and

```text
appointments.status = COMPLETED
```

This keeps the appointment and queue states synchronized.

---

# 📱 Mobile Application

A mobile application is planned/implemented as an additional client for the MediFlow backend.

The mobile application uses the same backend APIs.

```text
             ┌───────────────┐
             │ PostgreSQL DB │
             └───────▲───────┘
                     │
             ┌───────┴───────┐
             │ Backend REST  │
             │      API      │
             └───────▲───────┘
                     │
          ┌──────────┴──────────┐
          │                     │
     Web Frontend          Mobile App
```

This allows both platforms to use the same business logic and database.

---

# 🧪 Testing

APIs can be tested using **Postman**.

Example:

```text
1. Login
2. Copy JWT token
3. Add token to Authorization header
4. Call protected endpoint
5. Verify response
```

Example header:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# 🚀 Running the Project

## 1. Clone the repository

```bash
git clone <repository-url>
cd mediflow
```

## 2. Install backend dependencies

```bash
cd backend
npm install
```

## 3. Configure environment variables

Create a `.env` file:

```env
PORT=5000

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_jwt_secret
```

Use your actual PostgreSQL and JWT configuration.

## 4. Start backend

```bash
npm run dev
```

---

## 5. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

## 6. Start frontend

```bash
npm run dev
```

The Vite development server will provide the frontend URL.

---

# 🔒 Security

The application includes:

* JWT authentication
* Password hashing using bcrypt
* Role-based authorization
* Protected API endpoints
* Input validation
* Hospital ownership validation
* Doctor ownership validation
* Department ownership validation
* Transaction handling for important database operations

For example, a hospital administrator can only manage doctors belonging to their own hospital.

---

# 📊 Important Business Rules

### Doctor Management

A hospital admin can only:

* Add doctors to their hospital
* Assign doctors to departments belonging to their hospital
* Edit their hospital's doctors
* Enable/disable their hospital's doctors

### Queue Management

A doctor can only:

* Access their own queue
* Call patients in their queue
* Complete patients in their queue
* Skip patients in their queue

### Appointment Management

Appointments are synchronized with queue operations.

For example:

```text
Queue COMPLETED
       ↓
Appointment COMPLETED
```

---

# 🧩 Future Improvements

Possible future enhancements include:

* Real-time queue updates
* Push notifications
* Emergency capacity management
* Online consultation
* Prescription management
* Medical history
* Payment integration
* Hospital analytics dashboard
* Doctor availability scheduling
* Advanced search and filtering
* Mobile push notifications
* WebSocket-based live queue tracking

---

# 👨‍💻 Development

The project follows a modular structure where frontend pages communicate with backend controllers through REST APIs.

Example:

```text
React Component
      ↓
Axios API Service
      ↓
Express Route
      ↓
Authentication Middleware
      ↓
Controller
      ↓
PostgreSQL
```

For example, the doctor queue flow is:

```text
DoctorDashboard.tsx
       ↓
GET /queues/doctor
       ↓
Queue Controller
       ↓
PostgreSQL
       ↓
Queue Data
       ↓
DoctorDashboard
```

When completing a patient:

```text
DoctorDashboard
       ↓
PATCH /queues/doctor/:id/complete
       ↓
completeQueue()
       ↓
UPDATE queues
       ↓
UPDATE appointments
       ↓
Response
       ↓
Refresh Doctor Queue
```

---

# 📄 License

This project was developed as an academic/software engineering project.

---

# 👥 Contributors

**MediFlow Development Team**

* Lakshika Gobinath
* Project Team Members

---

# ⭐ MediFlow

**Smart Hospital Management System**

Connecting **Patients, Doctors, and Hospitals** through a unified digital platform.
