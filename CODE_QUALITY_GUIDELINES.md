# Code Quality & Engineering Practices

## 1. Principles
- **Modularity First:** Break features into reusable UI components (Next.js/React) and service classes (Laravel) to minimize duplication and simplify maintenance.
- **Separation of Concerns:** Keep presentation, business logic, and data access layers distinct; leverage hooks on the frontend and service/repository patterns on the backend.
- **Consistent Styling:** Adhere to the established pink-to-purple design system, Tailwind utility patterns, and shared UI primitives (Buttons, Cards, Tabs).
- **Framework Alignment:**
  - **Frontend:** Follow Next.js App Router conventions, TypeScript types, SWR for data fetching, and shadcn UI patterns.
  - **Backend:** Observe Laravel best practices—controllers for orchestration, services for business logic, resources for API shaping, and form requests for validation.
- **Documentation:** Provide inline comments for complex logic, maintain README updates for new modules, and keep architectural decisions recorded in ADR-style notes when scope is significant.

-## 2. Tooling & Automation
- **Linting & Formatting:** Enforce ESLint, Prettier, and StyleCI/Tailwind IntelliSense for consistent code style across the monorepo.
- **Type Safety:** Treat TypeScript and PHPStan/Psalm (where applicable) warnings as blockers; no unchecked `any` or `mixed` types in production code.
- **Git Workflow:** Even as a solo contributor, maintain feature branches with descriptive commit messages referencing requirement IDs for traceability. Use self-review checklists before merging to main.
- **CI Pipelines:** Run lint, build, and test suites on every push to ensure early detection of regressions.
- **Runtime Observability:** Utilize Laravel Telescope locally and in staging to inspect requests, jobs, queries, and exceptions before promoting changes to production.

## 3. Design Adherence Checklist
1. Use shared layout components (Sidebar, Header, Chatbot) to maintain UX consistency.
2. Match typography, spacing, and color tokens defined in Tailwind config.
3. Ensure responsive behavior using flex/grid utilities and breakpoints tested at mobile, tablet, desktop widths.
4. Provide accessible alternatives (ARIA labels, keyboard navigation, sufficient contrast) when designing new components.

-## 4. Code Review Expectations (Solo Developer Edition)
- Conduct self-reviews using a checklist: verify business logic against requirements, confirm tests are present, inspect Laravel Telescope output for unexpected queries/exceptions, and audit security/performance implications.
- Document review notes in commit descriptions or task comments to retain decision history despite operating solo.

## 5. Definition of Done
- Feature is covered by automated tests and passes CI pipelines.
- Documentation (README, API reference, or UI guide) updated as needed.
- No critical or high-severity lint/type warnings remaining.
- Stakeholder acceptance criteria met and demoed when required.
