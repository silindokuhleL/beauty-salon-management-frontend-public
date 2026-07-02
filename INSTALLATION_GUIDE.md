# Installation Guide – Beauty Salon Management Platform

> **Audience:** Solo developer setting up local, staging, or production environments for the Laravel backend and Next.js frontend.

## 1. Prerequisites
- PHP 8.2+, Composer
- Node.js 18+, npm or Yarn
- MySQL/MariaDB (or compatible database)
- Redis (optional for queues/cache)
- Git
- Laravel Sail or Docker (optional convenience layer)

## 2. Clone Repositories
```bash
# Backend
git clone https://github.com/your-org/beauty-salon-management-backend.git
cd beauty-salon-management-backend

# Frontend (separate workspace)
git clone https://github.com/your-org/beauty-salon-management-frontend.git
cd beauty-salon-management-frontend
```

## 3. Backend Setup (Laravel)
1. Copy environment template:
   ```bash
   cp .env.example .env
   ```
2. Configure `.env` values:
   - `APP_URL`, `FRONTEND_URL`
   - `DB_*` credentials
   - `SANCTUM_STATEFUL_DOMAINS`
   - Payment gateway keys (`PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`)
   - Mailer credentials for notifications
   - `TELESCOPE_ENABLED=true` for local/staging (disable or guard in production)
3. Install dependencies:
   ```bash
   composer install
   php artisan key:generate
   ```
4. Run migrations and seeders:
   ```bash
   php artisan migrate --seed
   ```
5. (Optional) Start queue worker and scheduler:
   ```bash
   php artisan queue:work
   php artisan schedule:work
   ```
6. Launch API server:
   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```

## 4. Frontend Setup (Next.js)
1. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```
2. Configure API endpoints and feature flags:
   - `NEXT_PUBLIC_API_URL=https://localhost:8000`
   - `NEXT_PUBLIC_TELESCOPE_URL` (if exposing telescope dashboards internally)
   - Analytics/feature flags as required
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run development server:
   ```bash
   npm run dev
   ```
5. Access the app at `http://localhost:3000`.

## 5. Staging/Production Deployment
- **Backend:**
  - Provision PHP environment (Forge/Vapor/Docker). 
  - Set environment variables, optimize config (`php artisan config:cache`, `route:cache`).
  - Configure HTTPS, queue workers, backups, and Telescope authorization gates.
- **Frontend:**
  - Deploy via Vercel or Node-compatible host (`npm run build && npm run start`).
  - Set environment variables for API, analytics, and feature toggles.
  - Configure rewrites/proxy if hosting API on separate domain; ensure CORS and Sanctum settings align.

## 6. Post-Install Checklist
- [ ] Confirm admin/owner account credentials from seed data.
- [ ] Verify Sanctum cookie auth by logging in via frontend.
- [ ] Run automated test suites:
  ```bash
  # Backend
  php artisan test
  # Frontend
  npm run test
  ```
- [ ] Validate Laravel Telescope accessible only to authorized users.
- [ ] Trigger sample booking flow end-to-end.
- [ ] Test payment integration using sandbox keys.
- [ ] Review logs for errors/warnings.

## 7. Troubleshooting
| Issue | Resolution |
|-------|------------|
| CORS errors between frontend/backend | Ensure `SANCTUM_STATEFUL_DOMAINS` and `SESSION_DOMAIN` set correctly; configure CORS middleware. |
| Sanctum cookies not set | Use HTTPS locally via Laravel Valet or double-check `APP_URL`, `FRONTEND_URL`, `SESSION_DOMAIN`. |
| Telescope unauthorized | Update `app/Providers/TelescopeServiceProvider.php` to allow your IP or authenticated role. |
| Queue jobs stuck | Confirm queue worker running and correct `QUEUE_CONNECTION`. |
| Payment callbacks failing | Check webhook URL accessibility, review server logs, and confirm sandbox keys. |

## 8. Maintenance Commands
- Clear caches: `php artisan optimize:clear`
- Update dependencies: `composer update`, `npm update`
- Database backup (example): `php artisan backup:run`
- Tail logs: `php artisan tail` or hosting provider equivalent

## 9. Reference
- `TECHNICAL_DOCUMENTATION.md`
- Official Laravel & Next.js deployment guides
- Payment gateway sandbox documentation
