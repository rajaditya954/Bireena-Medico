# Medico Hospital Backend - Refactored Architecture

## Overview
This is a scalable Express.js backend for the Medico Hospital Management System following the MVC + Service Layer architecture pattern.

## Project Structure

```
backend/
├── config/              # Configuration files
│   ├── env.js          # Environment variables
│   ├── database.js     # MongoDB connection
│   ├── razorpay.js     # Razorpay setup
│   ├── cloudinary.js   # Cloudinary setup
│   └── socket.js       # Socket.io setup
│
├── models/             # Mongoose schemas
│   ├── User.js
│   ├── Patient.js
│   ├── Doctor.js
│   ├── Appointment.js
│   ├── Queue.js
│   ├── Prescription.js
│   ├── Medicine.js
│   ├── Inventory.js
│   ├── LabTest.js
│   ├── LabReport.js
│   ├── Billing.js
│   ├── Invoice.js
│   ├── Payment.js
│   ├── Notification.js
│   ├── AuditLog.js
│   ├── RefreshToken.js
│   ├── Service.js
│   └── Role.js
│
├── controllers/        # Request handlers
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── patient.controller.js
│   ├── doctor.controller.js
│   ├── appointment.controller.js
│   ├── queue.controller.js
│   ├── prescription.controller.js
│   ├── laboratory.controller.js
│   ├── pharmacy.controller.js
│   ├── billing.controller.js
│   ├── payment.controller.js
│   ├── notification.controller.js
│   ├── report.controller.js
│   └── analytics.controller.js
│
├── services/          # Business logic
│   ├── auth.service.js
│   ├── user.service.js
│   ├── patient.service.js
│   ├── doctor.service.js
│   ├── appointment.service.js
│   ├── queue.service.js
│   ├── prescription.service.js
│   ├── laboratory.service.js
│   ├── pharmacy.service.js
│   ├── billing.service.js
│   ├── payment.service.js
│   ├── notification.service.js
│   ├── report.service.js
│   └── analytics.service.js
│
├── routes/            # API endpoints
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── patient.routes.js
│   ├── doctor.routes.js
│   ├── appointment.routes.js
│   ├── queue.routes.js
│   ├── prescription.routes.js
│   ├── laboratory.routes.js
│   ├── pharmacy.routes.js
│   ├── billing.routes.js
│   ├── payment.routes.js
│   ├── notification.routes.js
│   ├── report.routes.js
│   └── analytics.routes.js
│
├── middlewares/       # Express middlewares
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── upload.middleware.js
│   ├── validation.middleware.js
│   ├── error.middleware.js
│   └── rateLimiter.middleware.js
│
├── validators/        # Input validation schemas
│   ├── auth.validator.js
│   ├── patient.validator.js
│   ├── doctor.validator.js
│   ├── appointment.validator.js
│   ├── billing.validator.js
│   └── payment.validator.js
│
├── sockets/           # WebSocket handlers
│   ├── appointment.socket.js
│   ├── queue.socket.js
│   ├── notification.socket.js
│   └── index.js
│
├── jobs/              # Background jobs
│   ├── appointmentReminder.js
│   ├── inventoryAlert.js
│   ├── reportCleanup.js
│   └── dailyAnalytics.js
│
├── utils/             # Utility functions
│   ├── jwt.js
│   ├── hashPassword.js
│   ├── response.js
│   ├── email.js
│   ├── pagination.js
│   ├── generateInvoice.js
│   ├── logger.js
│   └── helpers.js
│
├── uploads/           # User uploaded files
│   ├── reports/
│   ├── prescriptions/
│   └── invoices/
│
├── docs/              # API documentation
│   └── swagger.yaml
│
├── app.js            # Express app setup
├── server.js         # Server entry point
├── package.json      # Dependencies
├── .env.example      # Example environment variables
└── README.md         # This file
```

## Request Flow

```
Request
  ↓
Route Handler
  ↓
Middleware (Auth, Validation)
  ↓
Controller
  ↓
Service
  ↓
Model
  ↓
MongoDB Database
```

## Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration.

### 3. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 4. Production Build

```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/change-password` - Change password

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor
- `GET /api/doctors/specialty/:specialization` - Get doctors by specialization

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `GET /api/appointments/patient/:patientId` - Get patient appointments
- `GET /api/appointments/doctor/:doctorId` - Get doctor appointments

### Queue Management
- `GET /api/queue/doctor/:doctorId` - Get queue for doctor
- `POST /api/queue` - Add patient to queue
- `PUT /api/queue/:queueId/checkin` - Check in patient
- `PUT /api/queue/:queueId/complete` - Complete consultation
- `GET /api/queue/:queueId/position` - Get queue position

### Prescriptions
- `GET /api/prescriptions/patient/:patientId` - Get patient prescriptions
- `GET /api/prescriptions/:id` - Get prescription by ID
- `POST /api/prescriptions` - Create prescription
- `PUT /api/prescriptions/:id` - Update prescription
- `DELETE /api/prescriptions/:id` - Delete prescription
- `GET /api/prescriptions/patient/:patientId/active` - Get active prescriptions

### Laboratory
- `GET /api/laboratory/tests` - Get all tests
- `POST /api/laboratory/tests` - Create test
- `GET /api/laboratory/reports/patient/:patientId` - Get patient reports
- `POST /api/laboratory/reports` - Create lab report
- `PUT /api/laboratory/reports/:id/status` - Update report status
- `PUT /api/laboratory/reports/:id/approve` - Approve report

### Pharmacy
- `GET /api/pharmacy` - Get all medicines
- `GET /api/pharmacy/:id` - Get medicine by ID
- `GET /api/pharmacy/search` - Search medicines
- `POST /api/pharmacy` - Create medicine
- `PUT /api/pharmacy/:id` - Update medicine
- `GET /api/pharmacy/stock/check` - Check stock
- `GET /api/pharmacy/stock/low` - Get low stock medicines

### Billing
- `POST /api/billing` - Create billing
- `GET /api/billing/:id` - Get billing by ID
- `GET /api/billing/patient/:patientId` - Get patient billings
- `PUT /api/billing/:id/status` - Update billing status
- `POST /api/billing/:billingId/invoice` - Generate invoice
- `GET /api/billing/:patientId/pending` - Get pending bills

### Payments
- `POST /api/payments` - Create payment
- `GET /api/payments/:id` - Get payment by ID
- `GET /api/payments/patient/:patientId` - Get patient payments
- `POST /api/payments/:paymentId/verify` - Verify payment
- `POST /api/payments/:paymentId/refund` - Refund payment
- `GET /api/payments/statistics` - Get payment statistics

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/unread/count` - Get unread count

### Reports & Analytics
- `GET /api/reports/labs` - Get lab reports
- `POST /api/reports/labs` - Create lab report
- `GET /api/analytics/dashboard` - Get dashboard metrics
- `GET /api/analytics/revenue` - Get revenue analytics
- `GET /api/analytics/patients` - Get patient analytics
- `GET /api/analytics/doctors` - Get doctor analytics

## WebSocket Events

### Appointment Events
- `appointment:create` - Create appointment
- `appointment:update` - Update appointment
- `appointment:cancel` - Cancel appointment
- `appointment:reminder` - Send reminder

### Queue Events
- `queue:join` - Patient joins queue
- `queue:checkin` - Patient checks in
- `queue:complete` - Consultation completed
- `queue:position` - Get queue position

### Notification Events
- `notification:subscribe` - Subscribe to notifications
- `notification:send` - Send notification
- `notification:broadcast` - Broadcast notification

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "details": []
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Rate Limiting

- General API: 100 requests per 15 minutes
- Login: 5 requests per 15 minutes
- Payments: 10 requests per hour

## Database

MongoDB is required. Configure connection in `.env`:

```
MONGO_URI=mongodb://localhost:27017/medico_hospital
```

## Security Best Practices

1. Keep `.env` file secret and not committed to version control
2. Use strong JWT secrets in production
3. Enable HTTPS in production
4. Implement proper CORS policies
5. Validate all user inputs
6. Implement rate limiting
7. Use password hashing (bcrypt)
8. Audit sensitive operations with AuditLog

## Scaling Considerations

1. **Database Indexing** - Add indexes on frequently queried fields
2. **Caching** - Implement Redis for caching
3. **Load Balancing** - Use nginx or similar for load distribution
4. **Microservices** - Break into services as needed
5. **Message Queue** - Use RabbitMQ or Redis for async jobs
6. **CDN** - Serve static files from CDN

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Monitoring

- Use Winston or similar for comprehensive logging
- Set up APM with New Relic or DataDog
- Monitor database performance
- Set up alerts for critical errors

## Contributing

1. Follow the project structure
2. Use meaningful commit messages
3. Add tests for new features
4. Update API documentation

## License

ISC

---

For more information, visit the frontend repository or contact the development team.
