# User Manual – Beauty Salon Management Platform

## 1. Introduction
Welcome to the Beauty Salon Management Platform. This guide walks through the system from the perspective of each role. The platform is web-based and accessible via modern desktop browsers. All features are delivered by a single developer, so some processes reference self-service support and embedded help.

## 2. Getting Started
1. **Access the Portal:** Navigate to the provided URL and sign in with your credentials. New users receive a welcome email with temporary passwords.
2. **Navigation:** The sidebar adjusts to your role, showing only relevant sections. Use the search bar or the chatbot for quick navigation tips.
3. **Profile Management:** Click your avatar in the header to update contact information and change passwords.

## 3. Role-Based Guides

### 3.1 Customers
- **Browse Services:** Visit *Services Marketplace* to explore offerings by category, salon, or promotions. Use smart search to narrow results.
- **Booking:** Select a service, choose a date/time, and confirm payment method. Promotional pricing and wallet credits apply automatically.
- **Manage Appointments:** View upcoming and past bookings under *My Appointments*. Reschedule or cancel within policy windows.
- **Wallet & Rewards:** Track wallet balance, add funds, and redeem rewards via *My Wallet* and *Rewards & Offers*.
- **Shop Products:** Purchase retail products under *Shop Products* and review order history in *My Orders*.
- **Favorites & Reviews:** Save preferred services and submit reviews for completed appointments.

### 3.2 Staff Members
- **Dashboard Overview:** See today’s schedule, performance stats, and notifications immediately after login.
- **Schedules:** Use *My Schedule* for day view and *My Appointments* for broader history. Status buttons allow quick updates (In Progress, Completed, etc.).
- **Leave Requests:** Submit requests and track approvals within *My Leave*. View any affected appointments before confirming.
- **Notifications:** Monitor alerts for reassigned bookings, schedule changes, and internal messages.
- **Support:** Consult the chatbot or telescope-assisted logs (via admin if needed) when troubleshooting service issues.

### 3.3 Reception / Front Desk
- **Calendar Management:** The *Appointments* module provides a master calendar. Create bookings on behalf of customers and assign staff manually if needed.
- **Customer Assistance:** Use global search to locate clients or bookings quickly; the system displays contact details and history.
- **Payments & Confirmations:** Record walk-in payments and ensure customers receive confirmation emails.
- **Notifications & Chatbot:** Stay updated on cancellations or policy changes; the chatbot offers quick answers to pricing or availability questions.

### 3.4 Managers
- **Service Catalogue:** Add or edit services, adjust pricing, and toggle promotions.
- **Reporting:** Access *Reports & Analytics* to view financial, appointment, and staff productivity dashboards.
- **Inventory:** Maintain product listings, monitor stock levels, and analyze sales trends.
- **Staff Oversight:** Approve leave, review schedules, and handle appointment reassignments.
- **Client Directory:** Export client lists, review appointment history, and respond to feedback.

### 3.5 Owners & Administrators
- **System Settings:** Update salon profile information, operating hours, and legal documentation under *System*.
- **Payment Management:** Configure accepted payment methods and review end-to-end payment records (including refunds).
- **Staff & Users:** Onboard new team members, assign roles, and manage permissions.
- **Promotions & Campaigns:** Launch promotions and monitor their impact.
- **Executive Dashboards:** Review KPIs (revenue, utilization, satisfaction) to guide strategic decisions.

### 3.6 IT Support
- **Configuration Assistance:** Support owners/admins with system settings, integrations, and environment tweaks.
- **Diagnostics:** Utilize Laravel Telescope (behind admin access) to inspect requests, queues, and exceptions.
- **Incident Response:** Follow runbooks for troubleshooting authentication, payment callbacks, and job processing.

### 3.7 Super Administrators
- **Tenant Onboarding:** Manage approval queue for new salons, verify documents, and activate accounts.
- **Platform Oversight:** Monitor global analytics, suspensions, and compliance tasks.
- **Policy Management:** Update platform-wide settings, ensuring consistency across tenants.

## 4. Common Features
- **Search:** Global search (top nav) spans services, customers, staff, and appointments. Results respect role permissions.
- **Notifications:** Bell icon displays payment updates, schedule changes, approvals, and system alerts.
- **Chatbot:** Access via bottom-right icon. Provides contextual guidance, quick links, and policy explanations.
- **Audit Trail:** Key actions are logged and reviewable by authorized roles to maintain accountability.

## 5. Self-Service Support
- **Knowledge Base:** Review the technical documentation and installation guide for deeper insights.
- **Telescope Logs:** Authorized users can review request/exception logs to debug issues.
- **Contact:** Since the project is maintained by a single developer, use the in-app feedback form or specified email for escalations.

## 6. FAQs
| Question | Answer |
|----------|--------|
| How do I reset my password? | Use the *Forgot Password* link on the login page or contact an administrator to trigger a reset. |
| Can I export reports? | Yes, managers and above can export CSV/JSON from the Reports and Payments modules. |
| How do I update payment settings? | Owners/Admins visit *System → Payment Methods* to add or modify options. |
| Who can see Telescope data? | Restricted to IT support, owners/admins, and the developer through designated middleware. |
| How do I request new features? | Submit feedback through the in-app chatbot or email; items will be reviewed during backlog refinement. |

## 7. Support & Maintenance
- Planned maintenance windows announced via dashboard notifications.
- For urgent incidents (e.g., downtime, payment failures), consult the incident response section of `DELIVERY_PROCESS.md` and contact the maintainer immediately.

## 8. Glossary
- **Tenant:** Individual salon or franchise operating within the platform.
- **SANCTUM:** Laravel’s authentication system for SPA tokens/cookies.
- **Telescope:** Laravel observability tool providing insights into requests, jobs, logs, and more.
- **SWR:** React data-fetching library used for caching and revalidation on the frontend.

## 9. Related Documents
- `INSTALLATION_GUIDE.md`
- `TECHNICAL_DOCUMENTATION.md`
- `SYSTEM_USE_CASES.md`
- `STAKEHOLDER_ANALYSIS.md`
