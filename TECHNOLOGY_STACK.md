# Technology Stack & Integrations

## 1. Core Platforms
| Layer | Technologies | Purpose |
|-------|--------------|---------|
| Frontend | **Next.js (App Router)**, React 18, TypeScript, Tailwind CSS, shadcn UI | Authenticated dashboards, customer marketplace, responsive UI framework |
| Backend | **Laravel 10**, PHP 8.2, Eloquent ORM, Service Layer pattern, Form Requests, API Resources | RESTful API, business logic, tenant-aware operations |
| Database | MySQL / MariaDB, Redis (optional) | Persistent storage for multi-tenant data, cache/queue support |
| Authentication | Laravel Sanctum, Spatie Permissions | Token/cookie-based auth, role + permission enforcement |
| Observability | **Laravel Telescope**, Laravel logging channels, CI dashboards | Deep inspection of requests, jobs, mail, notifications, application logs |
| Dev Tooling | ESLint, Prettier, PHPStan/Psalm, Jest/RTL, PHPUnit, Cypress/Playwright | Code quality, linting, testing suites |
| Deployment | Vercel (frontend), Laravel Forge/Vapor or Dockerized PHP host (backend) | Continuous delivery targets |

## 2. Supporting Libraries & Utilities
- **Axios** wrapper with interceptors for API calls (frontend).
- **SWR** for client-side data caching and revalidation.
- **Date-fns** for formatting and scheduling logic.
- **Lucide Icons / Heroicons** for consistent iconography.
- **Tailwind Plugins** for typography and forms.
- **Laravel Scout / Search** (optional) for full-text enhancements.

## 3. External Integrations
| Service | Integration Details | Usage |
|---------|---------------------|-------|
| Paystack (or equivalent payment gateway) | REST API via Laravel service, callbacks handled through booking/product controllers | Card payments, payment status tracking, refunds |
| Email Provider (SMTP/Mailgun/SES) | Laravel Mail channel, queue-friendly | Booking confirmations, staff notifications |
| Storage (S3/local) | Laravel Filesystem abstraction | Media assets for services, receipts |
| Analytics/Monitoring (optional) | Pageview trackers or APM tools | Usage analytics, performance insights |

## 4. Data Flow & Communication
1. **Client Requests:** Next.js frontend calls Laravel API via Axios using Sanctum-authenticated cookies.
2. **Business Logic:** Controllers delegate to service classes (e.g., BookingService, StaffLeaveService, PaymentService).
3. **Persistence:** Services interact with Eloquent models; transactions ensure atomic updates for payments and inventory.
4. **Async Jobs:** Queue-ready design for emails, notifications, and heavy processing (can leverage Redis or database queues).
5. **Observability:** Telescope captures request traces, query performance, and exceptions during development/staging. Logs and CI status provide additional visibility in production.

## 5. Integration Guidelines
- **Authentication:** Ensure frontend and backend domains are configured in `SANCTUM_STATEFUL_DOMAINS` and CORS settings.
- **Payment Callbacks:** Expose whitelisted endpoints with SSL enabled; verify signatures/tokens provided by the gateway.
- **Third-Party Updates:** Maintain environment-specific API keys via `.env`; never hard-code secrets.
- **Error Monitoring:** Combine Telescope with log aggregation (e.g., Papertrail, CloudWatch) for production triage.
- **Testing:** Mock external services in unit/integration tests; use gateway sandbox endpoints for automated E2E scenarios.

## 6. Deployment & Environment Strategy
- **Environments:** Local (development), Staging (integration testing), Production (live tenants).
- **Configuration:** Use `.env` per environment; commit `.env.example` with documented settings.
- **Build Pipeline:**
  - Frontend: `npm run lint && npm run build` with type-check.
  - Backend: `composer test`, `php artisan test`, `phpstan`.
- **Release Checklist:** Reference `DELIVERY_PROCESS.md` for solo deployment flow, including Telescope monitoring and rollback steps.

## 7. Future Enhancements
- Introduce container orchestration (Docker Compose, Kubernetes) for easier replication.
- Integrate background job processor (Horizon) for queue monitoring.
- Add analytics providers (Segment, Mixpanel) for deeper insights.
- Evaluate GraphQL gateway for complex reporting or integrations.

## 8. Related Documents
- `TECHNICAL_DOCUMENTATION.md`
- `INSTALLATION_GUIDE.md`
- `DELIVERY_PROCESS.md`
- `TESTING_STRATEGY.md`
