# HireLens - Frontend

> HireLens is an AI-powered recruitment platform that streamlines the hiring process by explaining,
  comparing, and guiding hiring decisions. The system consists of a modern web application built with Next.js
  (frontend) and Node.js/Express (backend).

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Authentication](#authentication)
- [Deployment](#deployment)

## 🎯 Overview

This is the frontend application for HireLens, an AI-powered recruitment platform. It provides two main interfaces:

- **Admin Dashboard** - For HR professionals to manage jobs, screen candidates, and manage the hiring pipeline
- **Talent Dashboard** - For candidates to build profiles, apply for jobs, and track applications

## 🛠 Tech Stack

### Core Framework

- **Next.js 16.2.3** - React framework with App Router
- **React 19.2.4** - UI library
- **TypeScript 5** - Type-safe JavaScript

### Styling & UI

- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Base UI** - Unstyled React components
- **Phantom UI** - Custom UI components
- **Lucide React** - Icon library
- **React Icons** - Additional icon set
- **next-themes** - Dark mode support

### State Management & Data Fetching

- **Redux Toolkit 2.9.0** - State management
- **React Query 5.87.1** - Server state management
- **React Hook Form 7.72.1** - Form management
- **Zod** - Schema validation (via React Hook Form)

### Rich Text & Media

- **Tiptap 2.26.2** - Rich text editor
  - @tiptap/starter-kit
  - @tiptap/extension-link
  - @tiptap/extension-placeholder
  - @tiptap/extension-underline
- **UploadThing 7.7.4** - File upload service
- **jsPDF 4.2.1** - PDF generation
- **jsPDF-AutoTable 5.0.7** - PDF tables
- **xlsx-js-style 1.2.0** - Excel export

### Charts & Visualization

- **Recharts 3.8.1** - Chart library

### Authentication

- **@react-oauth/google 0.13.5** - Google OAuth
- **cookies-next 6.1.1** - Cookie management

### User Experience

- **react-joyride 3.0.2** - Product tours and onboarding
- **react-hot-toast 2.6.0** - Toast notifications
- **nprogress 0.2.0** - Progress bar
- **date-fns 4.1.0** - Date utilities
- **react-phone-number-input 3.4.16** - Phone input
- **react-calendar 6.0.1** - Calendar component

### Utilities

- **clsx 2.1.1** - Conditional class names
- **tailwind-merge 3.5.0** - Tailwind class merging
- **class-variance-authority 0.7.1** - Component variants
- **tw-animate-css 1.4.0** - CSS animations
- **axios 1.15.0** - HTTP client
- **boneyard-js 1.7.7** - Utility functions

### Development

- **ESLint 9** - Code linting
- **TypeScript 5** - Type checking
- **@vercel/analytics 2.0.1** - Analytics

## ✨ Key Features

### Admin Dashboard

- **Job Management** - Create, edit, and publish job postings
- **AI Screening** - Screen candidates with AI-powered ranking and comparison
- **Pipeline Management** - Track candidates through hiring stages
- **Weighted Evaluation** - Customize screening weights for skills, experience, education
- **Candidate Comparison** - Side-by-side comparison with detailed reasoning
- **Contract Generation** - Generate employment contracts automatically
- **Email Automation** - Send interview and contract emails
- **Interactive Onboarding** - Guided tours for new users
- **Real-time Notifications** - Sound alerts and notifications for screening completion

### Talent Dashboard

- **Profile Building** - AI-assisted resume parsing and profile creation
- **Job Discovery** - Browse and apply for matching jobs
- **Application Tracking** - Real-time application status updates
- **Skill Management** - Showcase skills and achievements

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── admin/                   # Admin dashboard routes
│   │   ├── dashboard/          # Admin home
│   │   ├── jobs/               # Job management
│   │   ├── screening/          # AI screening interface
│   │   └── candidates/         # Candidate management
│   ├── dashboard/              # Talent dashboard
│   │   ├── profile/            # Profile management
│   │   ├── jobs/               # Job browsing
│   │   └── applications/       # Application tracking
│   ├── auth/                   # Authentication pages
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/                  # React components
│   ├── admin/                  # Admin-specific components
│   │   ├── jobs/              # Job-related components
│   │   ├── screening/         # Screening components
│   │   └── candidates/        # Candidate components
│   ├── dashboard/              # Talent dashboard components
│   ├── auth/                   # Authentication components
│   ├── form/                   # Form components
│   ├── notifications/          # Notification components
│   └── ui/                     # Reusable UI components
├── lib/                        # Utility functions
│   ├── api/                    # API client
│   └── utils/                  # Helper functions
├── public/                     # Static assets
│   └── sounds/                 # Notification sounds
├── hooks/                      # Custom React hooks
├── store/                      # Redux store
└── types/                      # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Backend API running on port 5000

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   NEXT_PUBLIC_UPLOADTHING_APP_ID=your_uploadthing_app_id
   ```

3. **Run development server**

   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to [http://localhost:8080](http://localhost:8080)

## 🔐 Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# UploadThing
NEXT_PUBLIC_UPLOADTHING_APP_ID=your_uploadthing_app_id
```

## 📦 Available Scripts

```bash
npm run dev      # Start development server on port 8080
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🏗 Component Architecture

### Component Organization

Components are organized by feature and reusability:

- **`components/ui/`** - Reusable UI components (buttons, inputs, cards, etc.)
- **`components/admin/`** - Admin-specific feature components
- **`components/dashboard/`** - Talent dashboard components
- **`components/form/`** - Form-related components
- **`components/notifications/`** - Notification system components

### Key Components

#### Admin Components

- `AdminJobEditForm` - Job creation and editing form
- `AdminJobCreateForm` - New job creation form
- `ResultsStep` - Screening results display with typing animation
- `ShortlistStep` - Candidate shortlisting interface
- `InterviewEmailStep` - Interview email composition
- `ContractGenerateStep` - Contract generation
- `JobOnboarding` - Admin onboarding tour
- `ScreeningOnboarding` - Screening onboarding tour

#### UI Components

- Rich text editor using Tiptap
- File upload with UploadThing
- Custom form inputs with validation
- Data tables with sorting and filtering
- Charts and visualizations with Recharts

## 📊 State Management

### Redux Toolkit

Used for global application state:

- User authentication state
- Theme preferences
- Global UI state

### React Query

Used for server state management:

- API data fetching
- Caching and synchronization
- Background refetching
- Optimistic updates

### Local State

Used for component-specific state:

- Form inputs
- UI toggles
- Temporary data

## 🔑 Authentication

### Google OAuth

- Uses `@react-oauth/google` for Google sign-in
- JWT tokens stored in cookies
- Protected routes check authentication status

### Authentication Flow

1. User clicks "Sign in with Google"
2. Redirects to Google OAuth consent screen
3. On success, receives OAuth token
4. Backend validates and issues JWT
5. JWT stored in httpOnly cookie
6. Subsequent requests include JWT for authentication

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect repository**
   - Link GitHub repository to Vercel

2. **Configure environment variables**
   - Add all environment variables in Vercel dashboard

3. **Deploy**
   - Automatic deployment on push to main branch
   - Preview deployments for pull requests

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

**Built with ❤️ by Code01**
