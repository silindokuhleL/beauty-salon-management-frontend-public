# Testing Strategy & Quality Assurance

## 1. Testing Objectives
- Validate that critical salon workflows (booking, payments, inventory, reporting) operate reliably across browsers and tenants.
- Detect regressions early through automated pipelines covering both frontend and backend.
- Provide measurable confidence via code coverage metrics and documented test evidence.

## 2. Testing Scope
- **Unit Tests:**
  - Backend: Controllers, services, policies, and helpers using PHPUnit.
  - Frontend: Utility functions, hooks, and isolated components via Jest/React Testing Library.
- **Integration Tests:**
  - API endpoints, database interactions, queued jobs, and payment integrations.
  - End-to-end booking flows (guest → payment → confirmation), wallet transactions, inventory adjustments.
- **UI/End-to-End Tests:**
  - Critical user journeys executed with Cypress or Playwright (login, booking, staff schedule, admin reports).
  - Cross-browser smoke suite (Chromium, WebKit, Firefox) for responsive validation.

## 3. Test Case Management
- Maintain living test case catalog linked to functional requirements (SYSTEM_REQUIREMENTS.md).
- Tag cases by module (Bookings, Payments, Inventory, Reports) and priority (P0–P3).
- Store scenario outlines and acceptance criteria in project management tool (e.g., Jira/Linear) with traceability to user stories.

## 4. Test Automation Pipeline (Solo Workflow)
1. **Pre-Commit:** Husky hooks for linting and unit tests on modified files before committing.
2. **Continuous Integration:** Automated pipeline on push executing full unit + integration suites, generating coverage reports for self-review.
3. **Scheduled Jobs:** Nightly regressions (e2e + load/performance smoke tests) triggered via CI scheduler with summary notifications routed to the developer.
4. **Release Candidate:** Complete manual exploratory checklist, accessibility audit, security scans, and document findings in release notes since no separate QA team exists.

## 5. Coverage & Quality Metrics
- Target 85% average coverage for backend services and controllers; 75% for frontend components/hooks.
- No critical severity defects open at release gates; high severity issues require sign-off from engineering lead and product owner.
- Track mean time to detect (MTTD) and mean time to resolve (MTTR) for production incidents, aiming for continuous improvement.

## 6. Test Data & Environments
- Maintain dedicated staging environment with anonymized tenant data sets.
- Use seeded fixtures/factories for repeatable backend tests and synthetic users for frontend e2e scenarios.
- Separate credentials for staging payment gateways and third-party integrations.
- Leverage Laravel Telescope in local/staging environments to inspect requests, queries, jobs, and exceptions during debugging and exploratory testing.

## 7. Reporting & Documentation
- Publish test run summaries (pass/fail rates, coverage deltas) after each pipeline.
- Archive test evidence and logs for compliance audits and stakeholder visibility.
- Incorporate findings into retrospectives, highlighting areas needing refactoring or additional instrumentation.

## 8. Continuous Improvement
- Review flaky tests weekly; quarantine and fix promptly, documenting root causes for future reference.
- Perform self retrospectives after each release to capture QA gaps and update checklists.
- Automate regression cases whenever new bugs are reported, ensuring lessons learned feed back into the test suite.
