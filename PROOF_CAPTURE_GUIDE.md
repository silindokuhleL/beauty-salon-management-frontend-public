# Proof Capture Guide

Use this guide to capture portfolio-ready evidence for the Beauty Salon Management Platform.

## Local Runtime

Backend:

```bash
cd ../beauty-salon-management-backend-public
php artisan serve --host=127.0.0.1 --port=8011
```

Frontend:

```bash
cd ../beauty-salon-management-frontend-public
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8011 npm run dev -- --hostname 127.0.0.1 --port 3200
```

Open:

```text
http://127.0.0.1:3200
```

## Demo Accounts

| Role | Email | Password | Proof Area |
| --- | --- | --- | --- |
| Super Admin | `superadmin@platform.com` | `password123` | Provider approval, platform analytics, global settings |
| Owner | `owner@glamourbeautysalon.com` | `password123` | Payments, product sales, reports, staff leave, users |
| Staff | `staff@glamourbeautysalon.com` | `password123` | Staff schedule, appointments, leave requests |
| Customer | `customer@example.com` | `password123` | Booking, wallet, purchases, appointments, services |

## Screenshot Checklist

Capture these images for portfolio, README, LinkedIn, and case-study proof.

| Status | Filename | Route | Account | What It Proves |
| --- | --- | --- | --- | --- |
| Done | `beauty-salon-super-admin-dashboard.png` | `/super-admin/dashboard` | Super Admin | Platform-level navigation, provider oversight, analytics surface |
| Done | `beauty-salon-owner-dashboard.png` | `/admin/admin-dashboard` | Owner | Tenant owner dashboard, metrics, reports, admin navigation |
| Done | `beauty-salon-payment-management.png` | `/admin/payments` | Owner | Card/cash payment management, revenue cards, refunds, mark-paid actions |
| Done | `beauty-salon-services-marketplace.png` | `/customer/services-marketplace` | Customer | Customer marketplace, service cards, discounts, booking calls to action |
| Pending | `beauty-salon-booking-confirmation.png` | `/customer/booking-confirmation` | Customer | Completed booking state, reference, service, staff, date/time |
| Pending | `beauty-salon-payment-callback.png` | `/payment-callback` | Customer | Payment callback/verification handling |
| Pending | `beauty-salon-product-sales.png` | `/admin/product-sales` | Owner | POS product sales, tenant-scoped stock, sales history |
| Pending | `beauty-salon-product-marketplace.png` | `/customer/products` | Customer | Customer product browsing and purchase flow |
| Pending | `beauty-salon-provider-approval.png` | `/super-admin/providers` | Super Admin | Provider approval/rejection/suspension workflow |
| Pending | `beauty-salon-staff-leave.png` | `/admin/staff-leave` | Owner | Leave approval, rejection, affected appointments, reassignment |
| Pending | `beauty-salon-user-permissions.png` | `/admin/users` | Owner | Role-aware user management and permission boundaries |
| Pending | `beauty-salon-mobile-booking.png` | `/customer/book` | Customer/mobile | Mobile booking responsiveness |
| Pending | `beauty-salon-mobile-admin.png` | `/admin/admin-dashboard` | Owner/mobile | Authenticated dashboard responsiveness |

## Suggested Viewports

Desktop:

```text
1440 x 1000
```

Mobile:

```text
390 x 844
```

Tablet:

```text
768 x 1024
```

## Capture Rules

- Use seeded demo data only.
- Do not show real API keys, real customer data, private messages, or personal accounts.
- Prefer full-page screenshots for dashboards and viewport screenshots for modals/actions.
- Capture one image per business capability instead of many near-duplicates.
- Keep filenames stable so the portfolio and README can link to them later.
- After any code change, rerun `npm run lint`, `npm run build`, and `npm audit --omit=dev`.

## Portfolio Story Order

1. Super Admin dashboard: platform control.
2. Owner dashboard: salon operations.
3. Booking and services marketplace: customer workflow.
4. Payment management: money movement.
5. Product sales: inventory and POS.
6. Staff leave: operational workflow.
7. Provider approval and users: governance and RBAC.
8. Mobile views: responsive product quality.

