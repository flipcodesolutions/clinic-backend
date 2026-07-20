const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Clinic Backend API",
      version: "1.0.0",
      description:
        "Role-wise clinic management APIs. Use Bearer JWT from `/api/auth/login` or `/api/auth/register`.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
        RegisterBody: {
          type: "object",
          required: ["first_name", "email", "phone", "password"],
          properties: {
            first_name: { type: "string" },
            last_name: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            password: { type: "string", format: "password" },
            roles: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "super_admin",
                  "doctor",
                  "patient",
                  "receptionist",
                  "caretaker",
                  "staff",
                ],
              },
              example: ["patient"],
            },
          },
        },
        LoginBody: {
          type: "object",
          required: ["password"],
          properties: {
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            password: { type: "string", format: "password" },
          },
        },
        Clinic: {
          type: "object",
          properties: {
            name: { type: "string" },
            registration_no: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            website: { type: "string" },
            logo: { type: "string" },
            address: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            country: { type: "string" },
            postal_code: { type: "string" },
            latitude: { type: "number" },
            longitude: { type: "number" },
            description: { type: "string" },
            status: { type: "string", enum: ["active", "inactive"] },
          },
        },
        Department: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["active", "inactive"] },
          },
        },
        Service: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            status: { type: "string", enum: ["active", "inactive"] },
          },
        },
        City: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            status: { type: "string", enum: ["active", "inactive"] },
          },
        },
        AppointmentCreate: {
          type: "object",
          required: ["clinic_id", "doctor_id", "appointment_date", "start_time"],
          properties: {
            clinic_id: { type: "integer" },
            doctor_id: { type: "integer" },
            patient_id: { type: "integer" },
            department_id: { type: "integer" },
            appointment_date: { type: "string", format: "date" },
            start_time: { type: "string", example: "10:00:00" },
            end_time: { type: "string", example: "10:15:00" },
            visit_type: { type: "string", enum: ["new", "follow_up"] },
            consultation_type: {
              type: "string",
              enum: ["in_person", "online"],
            },
            reason: { type: "string" },
          },
        },
        StatusUpdate: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string" },
            remarks: { type: "string" },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication (public + me)" },
      { name: "Admin", description: "Super admin APIs" },
      { name: "Doctor", description: "Doctor APIs" },
      { name: "Patient", description: "Patient APIs" },
      { name: "Receptionist", description: "Receptionist APIs" },
      { name: "Caretaker", description: "Caretaker APIs" },
      { name: "Staff", description: "Staff APIs" },
    ],
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterBody" },
              },
            },
          },
          responses: {
            201: { description: "Registered successfully" },
            400: { description: "Validation error" },
            409: { description: "Email or phone already exists" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginBody" },
              },
            },
          },
          responses: {
            200: { description: "Login successful" },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Current user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "User info" },
            401: { description: "Unauthorized" },
          },
        },
      },

      // Admin
      "/api/admin/clinics": {
        get: {
          tags: ["Admin"],
          summary: "List clinics",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Admin"],
          summary: "Create clinic",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Clinic" },
              },
            },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/admin/clinics/{id}": {
        get: {
          tags: ["Admin"],
          summary: "Get clinic",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: { 200: { description: "OK" }, 404: { description: "Not found" } },
        },
        put: {
          tags: ["Admin"],
          summary: "Update clinic",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Clinic" },
              },
            },
          },
          responses: { 200: { description: "Updated" } },
        },
        delete: {
          tags: ["Admin"],
          summary: "Delete clinic",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: { 200: { description: "Deleted" } },
        },
      },
      "/api/admin/departments": {
        get: {
          tags: ["Admin"],
          summary: "List departments",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Admin"],
          summary: "Create department",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Department" },
              },
            },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/admin/departments/{id}": {
        put: {
          tags: ["Admin"],
          summary: "Update department",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Department" },
              },
            },
          },
          responses: { 200: { description: "Updated" } },
        },
        delete: {
          tags: ["Admin"],
          summary: "Delete department",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: { 200: { description: "Deleted" } },
        },
      },
      "/api/admin/services": {
        get: {
          tags: ["Admin"],
          summary: "List services",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Admin"],
          summary: "Create service",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Service" },
              },
            },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/admin/services/{id}": {
        put: {
          tags: ["Admin"],
          summary: "Update service",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Service" },
              },
            },
          },
          responses: { 200: { description: "Updated" } },
        },
        delete: {
          tags: ["Admin"],
          summary: "Delete service",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: { 200: { description: "Deleted" } },
        },
      },
      "/api/admin/cities": {
        get: {
          tags: ["Admin"],
          summary: "List cities",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Admin"],
          summary: "Create city",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/City" },
              },
            },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/admin/cities/{id}": {
        put: {
          tags: ["Admin"],
          summary: "Update city",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/City" },
              },
            },
          },
          responses: { 200: { description: "Updated" } },
        },
        delete: {
          tags: ["Admin"],
          summary: "Delete city",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: { 200: { description: "Deleted" } },
        },
      },
      "/api/admin/users": {
        get: {
          tags: ["Admin"],
          summary: "List users",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/admin/users/{id}/status": {
        put: {
          tags: ["Admin"],
          summary: "Update user status",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: {
                      type: "string",
                      enum: ["active", "inactive", "blocked"],
                    },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Updated" } },
        },
      },
      "/api/admin/settings": {
        get: {
          tags: ["Admin"],
          summary: "List settings",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        put: {
          tags: ["Admin"],
          summary: "Upsert setting",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["setting_key"],
                  properties: {
                    setting_key: { type: "string" },
                    setting_value: { type: "string" },
                    description: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Saved" } },
        },
      },

      // Doctor
      "/api/doctor/profile": {
        get: {
          tags: ["Doctor"],
          summary: "Get doctor profile",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        put: {
          tags: ["Doctor"],
          summary: "Update doctor profile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Updated" } },
        },
      },
      "/api/doctor/experiences": {
        get: {
          tags: ["Doctor"],
          summary: "List experiences",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Doctor"],
          summary: "Add experience",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/doctor/experiences/{id}": {
        put: {
          tags: ["Doctor"],
          summary: "Update experience",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Updated" } },
        },
        delete: {
          tags: ["Doctor"],
          summary: "Delete experience",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: { 200: { description: "Deleted" } },
        },
      },
      "/api/doctor/achievements": {
        get: {
          tags: ["Doctor"],
          summary: "List achievements",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Doctor"],
          summary: "Add achievement",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/doctor/achievements/{id}": {
        put: {
          tags: ["Doctor"],
          summary: "Update achievement",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Updated" } },
        },
        delete: {
          tags: ["Doctor"],
          summary: "Delete achievement",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: { 200: { description: "Deleted" } },
        },
      },
      "/api/doctor/schedules": {
        get: {
          tags: ["Doctor"],
          summary: "List schedules",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Doctor"],
          summary: "Create schedule",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/doctor/schedules/{id}": {
        put: {
          tags: ["Doctor"],
          summary: "Update schedule",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Updated" } },
        },
        delete: {
          tags: ["Doctor"],
          summary: "Delete schedule",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: { 200: { description: "Deleted" } },
        },
      },
      "/api/doctor/leaves": {
        get: {
          tags: ["Doctor"],
          summary: "List leaves",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Doctor"],
          summary: "Apply leave",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["from_date", "to_date"],
                  properties: {
                    from_date: { type: "string", format: "date" },
                    to_date: { type: "string", format: "date" },
                    reason: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/doctor/leaves/{id}": {
        put: {
          tags: ["Doctor"],
          summary: "Update leave",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Updated" } },
        },
      },
      "/api/doctor/appointments": {
        get: {
          tags: ["Doctor"],
          summary: "My appointments",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/doctor/appointments/{id}/status": {
        put: {
          tags: ["Doctor"],
          summary: "Update appointment status",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StatusUpdate" },
              },
            },
          },
          responses: { 200: { description: "Updated" } },
        },
      },
      "/api/doctor/medical-records": {
        post: {
          tags: ["Doctor"],
          summary: "Create medical record",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/doctor/medical-records/{appointmentId}": {
        get: {
          tags: ["Doctor"],
          summary: "Get medical record by appointment",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "appointmentId",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/doctor/prescriptions": {
        post: {
          tags: ["Doctor"],
          summary: "Create prescription",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/doctor/prescriptions/{appointmentId}": {
        get: {
          tags: ["Doctor"],
          summary: "Get prescription by appointment",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "appointmentId",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: { 200: { description: "OK" } },
        },
      },

      // Patient
      "/api/patient/profile": {
        get: {
          tags: ["Patient"],
          summary: "Get patient profile",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        put: {
          tags: ["Patient"],
          summary: "Update patient profile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Updated" } },
        },
      },
      "/api/patient/appointments": {
        get: {
          tags: ["Patient"],
          summary: "My appointments",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Patient"],
          summary: "Book appointment",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AppointmentCreate" },
              },
            },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/patient/appointments/{id}": {
        get: {
          tags: ["Patient"],
          summary: "Appointment detail",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/patient/documents": {
        get: {
          tags: ["Patient"],
          summary: "List documents",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Patient"],
          summary: "Add document meta",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["document_type", "title", "file_path"],
                  properties: {
                    document_type: { type: "string" },
                    title: { type: "string" },
                    file_path: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/patient/documents/{id}": {
        delete: {
          tags: ["Patient"],
          summary: "Delete document",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: { 200: { description: "Deleted" } },
        },
      },
      "/api/patient/reviews": {
        get: {
          tags: ["Patient"],
          summary: "My reviews",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Patient"],
          summary: "Create review",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["rating"],
                  properties: {
                    doctor_id: { type: "integer" },
                    clinic_id: { type: "integer" },
                    rating: { type: "integer" },
                    review: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/patient/invoices": {
        get: {
          tags: ["Patient"],
          summary: "My invoices",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
      },

      // Receptionist
      "/api/receptionist/patients": {
        get: {
          tags: ["Receptionist"],
          summary: "Search / list patients",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "search", in: "query", schema: { type: "string" } },
          ],
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/receptionist/appointments": {
        get: {
          tags: ["Receptionist"],
          summary: "List appointments",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "clinic_id", in: "query", schema: { type: "integer" } },
            { name: "date", in: "query", schema: { type: "string", format: "date" } },
            { name: "status", in: "query", schema: { type: "string" } },
          ],
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Receptionist"],
          summary: "Create appointment",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AppointmentCreate" },
              },
            },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/receptionist/appointments/{id}": {
        put: {
          tags: ["Receptionist"],
          summary: "Update appointment",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Updated" } },
        },
      },
      "/api/receptionist/appointments/{id}/status": {
        put: {
          tags: ["Receptionist"],
          summary: "Change appointment status",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StatusUpdate" },
              },
            },
          },
          responses: { 200: { description: "Updated" } },
        },
      },
      "/api/receptionist/invoices": {
        get: {
          tags: ["Receptionist"],
          summary: "List invoices",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Receptionist"],
          summary: "Create invoice",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/receptionist/payments": {
        post: {
          tags: ["Receptionist"],
          summary: "Record payment",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["invoice_id", "payment_method", "amount"],
                  properties: {
                    invoice_id: { type: "integer" },
                    payment_method: {
                      type: "string",
                      enum: ["cash", "card", "upi", "net_banking", "other"],
                    },
                    transaction_id: { type: "string" },
                    amount: { type: "number" },
                    status: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/receptionist/vitals": {
        post: {
          tags: ["Receptionist"],
          summary: "Record vitals",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["appointment_id"],
                  properties: {
                    appointment_id: { type: "integer" },
                    temperature: { type: "number" },
                    pulse: { type: "integer" },
                    bp: { type: "string" },
                    height: { type: "number" },
                    weight: { type: "number" },
                    oxygen: { type: "number" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Created" } },
        },
      },

      // Caretaker
      "/api/caretaker/profile": {
        get: {
          tags: ["Caretaker"],
          summary: "Get caretaker profile",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        put: {
          tags: ["Caretaker"],
          summary: "Update caretaker profile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Updated" } },
        },
      },
      "/api/caretaker/patients": {
        get: {
          tags: ["Caretaker"],
          summary: "Linked patients",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/caretaker/appointments": {
        get: {
          tags: ["Caretaker"],
          summary: "Appointments for linked patients",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Caretaker"],
          summary: "Book for linked patient",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AppointmentCreate" },
              },
            },
          },
          responses: { 201: { description: "Created" } },
        },
      },

      // Staff
      "/api/staff/profile": {
        get: {
          tags: ["Staff"],
          summary: "Get staff profile",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" } },
        },
        put: {
          tags: ["Staff"],
          summary: "Update staff profile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Updated" } },
        },
      },
      "/api/staff/appointments": {
        get: {
          tags: ["Staff"],
          summary: "View clinic appointments",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "clinic_id", in: "query", schema: { type: "integer" } },
            { name: "date", in: "query", schema: { type: "string", format: "date" } },
          ],
          responses: { 200: { description: "OK" } },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
