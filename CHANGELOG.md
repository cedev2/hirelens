# Changelog

All notable changes made during admin dashboard refactor + auth improvements.

## 21 / 04 / 2026

### Added

- Landing page completely refactored for HR admin focus.
  - `frontend/app/components/HeroSection.tsx` - New hero: "AI-Powered Talent Acquisition" with admin dashboard CTAs.
  - `frontend/app/components/Header.tsx` - Admin navigation (Dashboard, Jobs, Screening) + admin login links.
  - `frontend/app/components/CategorySection.tsx` - 8 admin features: Job Management, AI Screening, Talent Pool, Analytics, Smart Search, Compliance, Resume Parser, Team Settings.
  - `frontend/app/components/FeaturedJobsSection.tsx` - "Active Job Postings" section linking to `/admin/jobs`.
  - `frontend/app/components/CtaSection.tsx` - "Transform Your Hiring Today" CTA.

- Footer pages created with full content.
  - `/about/companies` - Partner companies showcase with stats.
  - `/terms` - Terms of Service for HR admin platform.
  - `/advice` - Hiring best practices and AI screening tips.
  - `/privacy-policy` - GDPR-compliant privacy policy.
  - `/help-docs` - Documentation hub with FAQs.
  - `/guide` - 5-step getting started guide for new HR admins.
  - `/updates` - Product changelog and upcoming features.
  - `/contact-us` - Contact form with support info.

- Admin profile enhancements.
  - `frontend/app/admin/profile/page.tsx` - Phone number editing with `react-phone-number-input`.
  - `backend/src/controllers/auth.controller.ts` - Backend support for `phone` field in profile updates.

- NProgress page loading indicator.
  - `frontend/app/components/ProgressBar.tsx` - Global progress bar component.
  - `frontend/app/layout.tsx` - Integrated ProgressBar into root layout.

### Changed

- AdminSidebar dynamic data integration.
  - `frontend/app/components/admin/AdminSidebar.tsx` - Fetches admin profile from `/auth/me` API.
  - Dynamic name, role, and profile picture display.

- AdminRecentApplicationsTable talent data display.
  - `frontend/app/components/admin/dashboard/AdminRecentApplicationsTable.tsx` - Shows talent name, location, and experience from API.
  - Fixed experience rendering to handle array/string types.

- Screening weights UI/DB conversion.
  - `frontend/app/components/admin/jobs/screening/WeightsStep.tsx` - Converts DB decimals (0-1) to UI percentages (0-100).
  - `frontend/app/components/admin/jobs/AdminJobEditForm.tsx` - Same conversion logic for edit form.

### Fixed

- Runtime error in `AdminRecentApplicationsTable.tsx` - Object rendering issue with talent.experience field.
- AdminSidebar crash on refresh - Proper handling of nested API response data with optional chaining.

## 17 / 04 / 2026

### Added

- Talent Dashboard & Profile overhaul.
  - Real-time profile data synchronization using Redux Toolkit across Sidebar, Header, and Profile.
  - Interactive Profile Status navigation with smooth scroll to specific sections.
  - CV management: Added support for viewing uploaded resumes in a new tab and replacing them with new uploads.
  - Dynamic Job Application status tracking: Job cards now verify real-time status via API instead of hardcoded flags.
  - Production-ready Settings page with active session management, Google linking, and password setup flows.
  - Calendar system integration with real job/application dates and upcoming deadlines in the sidebar.

- Automated job-application confirmation email system.
  - Integrated `nodemailer` for email dispatch.
  - Responsive HTML template matching project design system.
  - Background email processing to ensure main flow is not blocked.
  - Environment-based configuration (`ENABLE_EMAILS`) and robust error logging.

### Fixed

- Calendar layout misalignment in `calendar.css` by switching to CSS Grid.
- Profile picture persistence bug: fixed backend controller to explicitly target the `User` model.
- Uploadthing deprecation: updated all file URLs to use the latest `ufsUrl` API.

## 16 / 04 / 2026

### Added

- Admin screening compare page at `frontend/app/admin/screening/[screeningId]/compare/page.tsx`.
  - Side-by-side candidate comparison.
  - Shared/unique skills + languages + other diff-oriented sections.
  - Resume view modal per candidate (iframe) when resume URL available.

- Admin screening results improvements in `frontend/app/components/admin/jobs/screening/ResultsStep.tsx`.
  - Summary vs detailed toggle.
  - Unified candidate selection for bulk email + compare.

- Admin profile page at `frontend/app/admin/profile/page.tsx`.
  - Fetch current user via `GET /auth/me`.
  - Update profile via `PUT /auth/profile` (firstName, lastName, picture).

- Auth password update endpoint.
  - `PUT /auth/password` (requires auth) implemented in `backend/src/controllers/auth.controller.ts`.
  - Route added in `backend/src/routers/auth.route.ts`.

- Google account linking for existing logged-in user.
  - `POST /auth/google/link/one-tap` (requires auth).
  - Links Google One Tap credential to current user; prevents linking if already used.

### Changed

- Admin dashboard job cards now fully API-driven.
  - `frontend/app/components/admin/dashboard/AdminDashboard.tsx` refactored to use shared `AdminJobsCards`.
  - Job actions wired (view/edit/open/close/delete) with React Query invalidation.

- Admin screening page now uses real API data.
  - `frontend/app/admin/screening/[screeningId]/page.tsx` fetches internal/external screening results.
  - External screening polling while processing.
  - Send email mutation wired to backend endpoint.

- Admin settings page integrated with backend auth + preferences.
  - `frontend/app/admin/settings/page.tsx` uses `GET /auth/me`.
  - Logout wired to `POST /auth/logout`.
  - Notification/account preferences persisted to `localStorage` per user.
  - Password change enabled via `PUT /auth/password`.
  - Google link UI added (One Tap) using `POST /auth/google/link/one-tap`.

- Auth routes now protected where needed.
  - `GET /auth/me`, `POST /auth/logout`, `PUT /auth/profile`, `POST /auth/refresh` now require auth middleware.
  - Fixes issue: `/auth/me` returned `Not authenticated` even after login.

- `GET /auth/me` response now exposes Google-link status without leaking `googleId`.
  - `backend/src/services/auth.service.ts` returns `hasGoogle: boolean` and strips `googleId`.

### Notes

- Frontend API client (`frontend/lib/api/client.ts`) sends `Authorization: Bearer <accessToken>` from `localStorage`.
- Local password update applies to local accounts only (accounts without password return error prompting Google login).
