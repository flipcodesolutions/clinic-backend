# Role-wise APIs

Base URL: `/api`

Roles (from `users.roles` JSON): `super_admin`, `doctor`, `patient`, `receptionist`, `caretaker`, `staff`

---

## Common (all users) — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register user |
| POST | `/login` | No | Login |
| GET | `/me` | Yes | Current user |

---

## Super Admin — `/api/admin`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/clinics` | List / create clinics |
| GET/PUT/DELETE | `/clinics/:id` | Clinic detail / update / delete |
| GET/POST | `/departments` | List / create departments |
| GET/PUT/DELETE | `/departments/:id` | Department CRUD |
| GET/POST | `/services` | List / create services |
| GET/PUT/DELETE | `/services/:id` | Service CRUD |
| GET/POST | `/cities` | List / create cities |
| GET/PUT/DELETE | `/cities/:id` | City CRUD |
| GET | `/users` | List users |
| PUT | `/users/:id/status` | Update user status |
| GET/PUT | `/settings` | System settings |

---

## Doctor — `/api/doctor`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/profile` | Get / update doctor profile |
| GET/POST | `/experiences` | List / add experience |
| PUT/DELETE | `/experiences/:id` | Update / delete experience |
| GET/POST | `/achievements` | List / add achievement |
| PUT/DELETE | `/achievements/:id` | Update / delete achievement |
| GET/POST | `/schedules` | List / create schedule |
| PUT/DELETE | `/schedules/:id` | Update / delete schedule |
| GET/POST | `/leaves` | List / apply leave |
| PUT | `/leaves/:id` | Update leave |
| GET | `/appointments` | My appointments |
| PUT | `/appointments/:id/status` | Update appointment status |
| POST | `/medical-records` | Create clinical notes |
| GET | `/medical-records/:appointmentId` | Get notes by appointment |
| POST | `/prescriptions` | Create prescription |
| GET | `/prescriptions/:appointmentId` | Get prescription |

---

## Patient — `/api/patient`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/profile` | Get / update patient profile |
| GET/POST | `/appointments` | My appointments / book |
| GET | `/appointments/:id` | Appointment detail |
| GET/POST | `/documents` | List / upload document meta |
| DELETE | `/documents/:id` | Delete document |
| GET/POST | `/reviews` | List my reviews / create review |
| GET | `/invoices` | My invoices |

---

## Receptionist — `/api/receptionist`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/patients` | Search / list patients |
| GET/POST | `/appointments` | List / create appointments |
| PUT | `/appointments/:id` | Update appointment |
| PUT | `/appointments/:id/status` | Change status |
| GET/POST | `/invoices` | List / create invoice |
| POST | `/payments` | Record payment |
| POST | `/vitals` | Record vitals for appointment |

---

## Caretaker — `/api/caretaker`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/profile` | Get / update caretaker profile |
| GET | `/patients` | Linked patients |
| GET | `/appointments` | Appointments for linked patients |
| POST | `/appointments` | Book for linked patient |

---

## Staff — `/api/staff`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/profile` | Get / update staff profile |
| GET | `/appointments` | Clinic appointments (view) |
