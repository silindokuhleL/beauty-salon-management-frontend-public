# User Interface Guide – Beauty Salon Management Platform

## 1. Design System Overview
- **Theme:** Pink-to-purple gradient palette with soft neutrals (slate/white) for contrast.
- **Typography:** Tailwind defaults with `font-sans` (Inter) for body text, bold headers for hierarchy.
- **Spacing:** Consistent use of Tailwind spacing scale (`p-4`, `p-6`, `gap-4`) to maintain visual rhythm.
- **Components:** Shared UI primitives (Buttons, Cards, Tabs, Tables) styled via shadcn UI and custom Tailwind classes.
- **Icons:** Lucide React icon set across navigation, statuses, and actions.

## 2. Layout Structure
- **Sidebar:** Persistent navigation on desktop with role-aware menu items, gradient accent, and active state highlight.
- **Header:** Contains search, notifications, user menu, and mobile menu toggle.
- **Content Area:** Scrollable main panel with gradient background overlay, responsive padding, and card-based sections.
- **Chatbot:** Floating action button bottom-right, expanding into conversation panel.

## 3. Navigation Patterns
- Role-based menus defined centrally in `Sidebar.tsx` ensuring consistent experience per user type.
- Breadcrumb-like context via headings and subtitles in each page component.
- Tabs used for sub-navigation (e.g., Appointments page, Rewards page) to break down complex workflows.
- Mobile view collapses sidebar into slide-over panel; header retains essential controls.

## 4. Key Screens & Components
| Screen | Highlights |
|--------|------------|
| **Dashboard** | KPI cards, quick actions, gradient hero section, responsive card layout |
| **Appointments (Admin/Manager)** | Two-tab layout (All Appointments, Today's Schedule), cards with status badges, action dropdowns |
| **Services Marketplace** | Grid of service cards, filters/search, promotional badges, wallet integration |
| **Staff Schedule** | Card list with status chips, client details, quick refresh, empty states |
| **System Settings** | Tabs (Salon Profile, Business Info, Operating Hours, Notifications), form inputs with validation | 
| **Payment Management** | Table with search/filter, status badges, mark-paid/refund actions |
| **Rewards & Offers** | Tabbed layout, statistics summary, interactive referral tools |
| **Chatbot** | Gradient header, message bubbles with role-based suggestions |

## 5. Interaction Guidelines
- **Buttons:** Primary (gradient), secondary (outline), destructive (red tones). Use size classes (`sm`, `md`, `lg`) based on context.
- **Forms:** Utilize `Label`, `Input`, `Textarea`, `Select` components; display validation feedback inline.
- **Tables:** Shadcn table components with zebra striping and hover states for readability.
- **Cards:** `CardHeader` + `CardContent` pattern for consistent sections; optional icons for visual anchors.
- **Badges/Chips:** Color-coded status (green=success, yellow=warning, red=alert, purple=pending, blue=info).
- **Empty States:** Use icons + message + optional CTA encouraging next action.

## 6. Accessibility Considerations
- Maintain color contrast ratios (≥ 4.5:1 for text) within gradient backgrounds.
- Ensure keyboard navigation via focus styles; modals and slideovers trap focus correctly.
- Provide descriptive `aria-labels` for icon-only buttons (e.g., search, notifications, chatbot toggle).
- Use semantic HTML structure (`main`, `nav`, `header`, `section`) within page components.

## 7. Responsiveness Checklist
- Test breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).
- Collapse multi-column grids into single-column stacks on mobile.
- Adjust typography (e.g., `text-3xl md:text-4xl`) for hero headings.
- Use `overflow-y-auto` on cards/lists to maintain scroll within content area.

## 8. UI Assets & Resources
- Tailwind configuration: `tailwind.config.js` for color palette, fonts, and plugins.
- Shared CSS utilities: `globals.css` and component-level styles.
- Image assets stored in `public/` or fetched via service URLs.
- Design reference of gradients and icons documented in project README.

## 9. Change Management
- Update shared components when introducing new patterns to keep UI consistent.
- Document major UI changes in release notes and update screenshots in accompanying materials.
- Perform visual regression tests (manual or automated) when modifying global styles.

## 10. Related Documents
- `SYSTEM_USE_CASES.md`
- `USER_MANUAL.md`
- `CODE_QUALITY_GUIDELINES.md`
- `TESTING_STRATEGY.md`
