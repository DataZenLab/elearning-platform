# EduFlow — Enterprise Online Learning & Course Management Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Strapi_CMS-Headless-4945FF?style=for-the-badge&logo=strapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Auth_&_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Deployment-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

<p align="center">
  A production-grade, full-stack Learning Management System (LMS) engineered with Next.js App Router, Strapi Headless CMS, and Firebase. Features role-based access for Students, Instructors, and Administrators with comprehensive learning progress tracking, video player, quizzes, certificates, and real-time dashboards.
</p>

---

## 🌟 Key Features

### 🎓 Student Experience
- **Modern Course Discovery:** Filter and search courses by category, difficulty level, and rating.
- **Interactive Learning Environment:** Structured lesson playback with video player, lesson transcripts, downloadable resources, and lesson completion checkmarks.
- **Quizzes & Assessments:** Multi-question timed quizzes with instant grading, score review, and retake policies.
- **Certificates of Completion:** Automated certificate generation upon 100% course completion.
- **Gamified Leaderboard:** Points and ranking system based on completed lessons, quiz achievements, and learning streaks.
- **Student Dashboard:** Track enrolled courses, active progress percentages, hours spent, and certificates earned.

### 👨‍🏫 Instructor Workspace
- **Course Studio:** Create, edit, and organize courses with modules, chapters, and rich media lessons.
- **Student Analytics:** Real-time visibility into enrollments, completion rates, and average quiz scores using interactive Recharts.
- **Q&A & Discussion Management:** Answer student questions, moderate comments, and engage with learners.

### 🛡️ Administrator Portal
- **Platform Overview:** High-level metrics on total active users, courses published, revenue trends, and platform engagement.
- **User Governance:** Manage student and instructor accounts, role assignments, and permissions.
- **Course Moderation:** Review submitted courses before public publication.

---

## 🏗️ System Architecture

```
                               ┌────────────────────────┐
                               │   Next.js App Router   │
                               │   (Frontend & BFF)     │
                               └──────────┬─────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌────────────────────────┐                      ┌────────────────────────┐
     │   Strapi Headless CMS  │                      │   Firebase Ecosystem   │
     ├────────────────────────┤                      ├────────────────────────┤
     │ • Course Catalog       │                      │ • User Authentication  │
     │ • Curriculum Modules   │                      │ • Progress Data Store  │
     │ • Lessons & Media      │                      │ • Certificate Records  │
     │ • Category Taxonomy    │                      │ • Real-time Sync       │
     └────────────────────────┘                      └────────────────────────┘
```

---

## 🛠️ Tech Stack & Tooling

- **Core:** Next.js 16 (Turbopack, App Router, Server Components & Actions), React 19, TypeScript 5
- **Styling:** Tailwind CSS v4, Radix / Base UI Primitives, Lucide Icons, tw-animate-css
- **State Management & Caching:** TanStack React Query v5, Zustand v5
- **Backend & CMS:** Strapi Headless CMS (REST API with qs query filters)
- **Identity & Data Sync:** Firebase Authentication & Cloud Firestore
- **Data Visualization:** Recharts
- **Emails:** Nodemailer (SMTP transactional order & progress updates)
- **Deployment:** Vercel (Edge-optimized Next.js deployment)

---

## 🚀 Getting Started

### Prerequisites
- Node.js `>= 20.x`
- npm or pnpm
- (Optional) Strapi CMS instance running locally or on cloud

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/eduflow.git
cd eduflow
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and populate your credentials:
```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Strapi CMS
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_strapi_token_here

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## ☁️ Deployment to Vercel

The application is pre-configured with `vercel.json` for one-click deployment:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your repository to GitHub.
2. Import the repository into **Vercel**.
3. Under **Environment Variables**, add the variables defined in `.env.example`.
4. Deploy! Next.js App Router and Server Components will be hosted automatically.

---

## 📁 Project Structure

```
elearning-platform/
├── public/                 # Static assets, logos, and illustrations
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (admin)/        # Admin management pages
│   │   ├── (dashboard)/    # Student learning dashboard, quizzes, certs
│   │   ├── (instructor)/   # Instructor portal & course editor
│   │   ├── (public)/       # Public landing, catalog, course details, checkout
│   │   ├── api/            # Serverless API routes
│   │   └── learn/          # Immersive course player room
│   ├── components/         # Reusable UI component library
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Shared utilities and configurations
│   ├── providers/          # Theme, Query, and Auth providers
│   ├── services/           # Strapi and backend API clients
│   ├── stores/             # Zustand global client stores
│   └── types/              # TypeScript types & interface definitions
├── strapi/                 # Strapi CMS schema & configuration
├── vercel.json             # Vercel deployment specification
└── package.json
```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.