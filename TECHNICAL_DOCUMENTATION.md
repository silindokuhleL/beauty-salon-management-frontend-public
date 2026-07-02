# Technical Documentation – Beauty Salon Management Platform

## 1. Architecture Overview
- **Frontend:** Next.js (App Router) with TypeScript, Tailwind CSS, SWR for data fetching, shadcn UI components.
- **Backend:** Laravel API with Spatie Permissions, service layer abstraction, form requests for validation, API resources for responses.
- **Database:** MySQL or MariaDB (configurable) with migration-based schema management.
- **Authentication:** Laravel Sanctum with tenant-aware middleware (`check.license`).
- **Observability:** Laravel Telescope for request/job/query monitoring, centralized logging, CI dashboards.
- **Deployment Targets:** Vercel/Node hosting for frontend, Laravel-compatible PHP host for backend (e.g., Forge, Vapor, Docker stack).

```
+-------------+          HTTPS          +-----------------+
|  Next.js    |  <--------------------> |  Laravel API    |
|  Frontend   |                         |  (Sanctum,      |
|  (breeze)   |                         |  Services,      |
+-------------+                         |  Telescope)     |
        |                                +-----------------+
        | GraphQL-like JSON APIs
        v
  Browser/SWR cache
```

## 2. Module Breakdown
### 2.1 Frontend Modules
- **Routing Framework:** `src/app/(auth)` for login/register, `src/app/(app)` for authenticated layout, segmented by role directories (admin, staff, customer).
- **Shared Components:** Sidebar, Header, Chatbot, UI primitives (buttons, cards, tables), loading skeletons.
- **Hooks & Lib:** Authentication hook (`useAuth`), bookings hooks (`useAppointmentActions`), axios wrapper with interceptors, utility helpers.
- **Styling:** Tailwind configuration, theme tokens, gradient backgrounds, responsive breakpoints.

### 2.2 Backend Modules
- **Controllers:** Domain-specific (BookingPaymentController, StaffLeaveController, PaymentManagementController, etc.).
- **Services:** Business logic encapsulated for bookings, staff availability, payments, reporting.
- **Models:** Eloquent models with relationships, accessors/mutators (e.g., `Service::getEffectivePriceNumericAttribute`).
- **Notifications:** Email channels for staff availability, booking confirmations.
- **Jobs/Queues:** (Future-ready) available for asynchronous tasks (email dispatch, report generation).

## 3. Key Workflows
1. **Booking Flow:** Guest/customer selects service → availability check → optional payment initialization → booking confirmation → staff auto allocation → notifications.
2. **Staff Leave:** Staff requests leave → manager/owner approval → affected appointments identified → reassignment via dedicated endpoints.
3. **Payment Management:** Transactions recorded with payment status, owners/admins can mark cash payments, process refunds, and view analytics.
4. **Rewards & Wallet:** Customers manage wallet balance, earn/redeem rewards, tracked via dedicated API routes.
5. **AI Assistance:** Chatbot consumes backend endpoints to provide contextual assistance across roles.

## 4. Data Model Snapshot
| Entity | Key Fields | Relationships |
|--------|------------|---------------|
| Tenants | name, address, license_status, operating_hours | hasMany Users, Services, Appointments |
| Users | name, email, roles, permissions, tenant_id | belongsTo Tenant, hasMany Appointments |
| Services | name, category, price, promotion fields | belongsTo Tenant, hasMany Appointments |
| Appointments | service_id, staff_id, status, payment info | belongsTo Service, Staff (User), Tenant |
| StaffLeave | staff_id, dates, status, affected_appointments | belongsTo User |
| Payments | reference, amount, method, status | belongsTo Appointment/User |
| Wallets & Transactions | balance, transaction_type, amount | belongsTo User |
| Reviews | rating, comment, status, appointment_id | belongsTo Appointment |

## 5. API Surface (Representative)
- `GET /api/public/services` – public listing with promotions.
- `POST /api/customer/booking` – create authenticated booking.
- `PATCH /api/customer/booking/{id}/reschedule` – reschedule appointment.
- `POST /api/booking/initialize-payment` – start payment flow.
- `GET /api/appointments/today-schedule` – staff schedule.
- `POST /api/staff-leave` / `POST /api/staff-leave/{id}/reassign` – leave management.
- `GET /api/payments/analytics` – revenue dashboard data.
- `GET /api/rewards/stats` – loyalty metrics.
- `GET /api/providers` – platform operator view for tenant approvals.

Complete route definitions available in `beauty-salon-management/routes/api.php`.

## 6. Configuration & Environment Variables
- `APP_URL`, `FRONTEND_URL`
- `DB_*` credentials
- `SANCTUM_STATEFUL_DOMAINS`
- Payment gateway keys (e.g., `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`)
- `TELESCOPE_ENABLED`, `QUEUE_CONNECTION`, email credentials
- Frontend `.env` example includes API base URL, analytics keys, feature flags.

## 7. Deployment Considerations
- Run database migrations and seeders (`php artisan migrate --seed`).
- Publish Laravel Telescope assets and restrict access via middleware in production.
- Configure cache/queue workers; schedule cron tasks for reports/emails if enabled.
- Frontend build via `npm run build` (or `next build`) with environment variables set for API endpoints and analytics keys.
- Use HTTPS and secure cookies for Sanctum when deploying across domains.

## 8. Monitoring & Maintenance
- Laravel Telescope dashboards: monitor requests, commands, jobs, mail, notifications.
- Log aggregation (e.g., Laravel Log Channels, CloudWatch, Papertrail) recommended.
- CI pipeline status (lint/test/build) visible via GitHub/GitLab checks.
- Regular dependency updates (Composer, npm) with automated security scans.
- Backup database and storage daily; ensure retention policy matches compliance requirements.

## 9. Reference Documents
- `SYSTEM_REQUIREMENTS.md` – comprehensive requirements.
- `TESTING_STRATEGY.md` – QA approach and metrics.
- `DELIVERY_PROCESS.md` – SDLC cadence and release workflow.
- `INSTALLATION_GUIDE.md` – setup steps for local/staging environments.
- `USER_MANUAL.md` – role-based walkthroughs for end users.
