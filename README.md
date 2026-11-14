# Doctor Tracker — Clinical Operations & Physician Management Portal

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.1-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Cloud-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.3.3-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Description

**Doctor Tracker** is a secure, full-stack enterprise healthcare administration web application engineered to streamline the clinical lifecycle of medical practitioners and their patient rosters. Developed to meet strict clinical management specifications, the platform enables authenticated hospital administrators to onboard and manage medical specialists, register and track patient profiles, assign patients dynamically based on physician caseloads, and monitor operational analytics such as bed distribution, patient-doctor ratios, and condition breakdowns in real time.

---

## 2. Setup Guide

Follow the instructions below to run the application locally on your workstation.

### Prerequisites
- **Node.js**: v18.18.0 or newer (Tested on Node.js v20.x & v24.x)
- **Package Manager**: npm (v9+), yarn, or pnpm
- **Database**: Active MongoDB Atlas cluster or a local MongoDB service

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/doctor-tracker.git
cd doctor-tracker
```

#### 2. Configure Environment Variables
Create a `.env.local` file in the root directory by duplicating `.env.example`:

```bash
cp .env.example .env.local
```

Configure your local configuration parameters inside `.env.local`:
```env
# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/doctor-tracker?retryWrites=true&w=majority

# NextAuth.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

#### 3. Install Dependencies
```bash
npm install --legacy-peer-deps
```

#### 4. Seed Database with Initial Clinical Dataset
Execute the database seeder to populate MongoDB with pre-indexed physician records (12 doctors across multiple specialties) and structured patient entries (30 patients with diverse clinical conditions):

```bash
npm run seed
```

> **Default Seed Credentials:**
> - **Administrator Email:** `admin@doctortracker.health`
> - **Password:** `admin123`

#### 5. Start the Development Server
```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

#### 6. Production Build Verification
To ensure strict type-safety and bundle optimization before production deployment:
```bash
npm run build
npm run start
```

---

## 3. System Architecture

The application is architected around a unified Next.js App Router full-stack paradigm communicating with a cloud MongoDB database through standard RESTful endpoints.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Browser Layer                          │
│                                                                         │
│   ┌─────────────────────┐   ┌────────────────────┐   ┌──────────────┐   │
│   │  Clinical Dashboard │   │  Doctor Directory  │   │ Patient Desk │   │
│   │  (Recharts Engine)  │   │ (Search & Filters) │   │ (Assignment) │   │
│   └──────────┬──────────┘   └─────────┬──────────┘   └──────┬───────┘   │
└──────────────┼────────────────────────┼─────────────────────┼───────────┘
               │                        │                     │
               │ HTTP Requests (JSON)   │                     │
               ▼                        ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   Next.js Full-Stack Application Layer                  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                       Next.js Route Handlers                    │   │
│   │  • /api/doctors             • /api/patients                     │   │
│   │  • /api/doctors/[id]        • /api/patients/[id]                │   │
│   │  • /api/dashboard/stats     • /api/auth/[...nextauth]           │   │
│   └────────────────────────────────┬────────────────────────────────┘   │
│                                    │                                    │
│   ┌────────────────────────────────▼────────────────────────────────┐   │
│   │                   Data Access Layer (Mongoose)                  │   │
│   │  • Connection Pooling & Buffer Management                       │   │
│   │  • Schema Validation & Compound Index Constraints               │   │
│   └────────────────────────────────┬────────────────────────────────┘   │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
                                     │ TLS 1.3 / WiredTiger
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          MongoDB Atlas Cluster                          │
│                                                                         │
│   ┌────────────────────┐  ┌─────────────────────┐  ┌────────────────┐   │
│   │    doctors Col     │  │    patients Col     │  │   users Col    │   │
│   │  - Text Index      │  │  - Doctor Ref (FK)  │  │  - Admin Creds │   │
│   │  - Date Index      │  │  - Condition Index  │  │  - Bcrypt Hash │   │
│   └────────────────────┘  └─────────────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Core Architecture Highlights
- **Single-Origin Deployment:** Consolidates frontend rendering and backend REST routes into one seamless edge-ready artifact, eliminating CORS configuration complexity.
- **Connection Caching:** The database connection layer implements a persistent global connection cache (`global.mongooseCache`) to reuse socket pools across hot serverless lambdas.
- **Cascading State Integrity:** When a physician record is deleted (`DELETE /api/doctors/[id]`), the system executes a transactional batch update across the `patients` collection, automatically setting orphaned foreign keys to `null` (`Unassigned`) to prevent data corruption.

---

## 4. Technical Decisions

### Decision 1: Next.js Integrated App Router vs. Standalone Node.js/Express Server
- **Problem Statement:** The project specification required full REST API principles and permitted either a unified full-stack Next.js environment or a decoupled Express server.
- **Evaluation:** Maintaining a standalone Express server introduces multiple deployment pipelines, separate CORS headers, configuration duplication, and dual hosting environments.
- **Chosen Solution:** Implemented Next.js App Router route handlers (`app/api/*`).
- **Impact & Benefits:**
  1. **Zero-Latency Data Contracts:** TypeScript interfaces (`Doctor`, `Patient`, `AdminUser`) are directly shared between API response bodies and UI state managers, eliminating typing drifts.
  2. **Cost-Free Scalability:** Deployable on serverless edge networks (Vercel) at zero hosting expenditure with automated CI/CD.
  3. **Standard RESTful Compliance:** All CRUD operations adhere strictly to canonical HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) with appropriate status codes (`200`, `201`, `400`, `404`, `409`, `500`).

### Decision 2: MongoDB Server-Side Compound Indexing & Native Aggregation vs. Client-Side Compute
- **Problem Statement:** The administrative dashboard requires high-frequency metric calculations (physician workload distribution, specialty ratios, condition prevalence) alongside live multi-field search and date-range filters across large tables.
- **Evaluation:** Fetching unpaginated datasets to compute metrics and filter arrays inside browser memory causes high client memory consumption, frame drops, and unnecessary bandwidth usage.
- **Chosen Solution:** Offloaded all aggregations and filtering to the MongoDB query engine.
- **Impact & Benefits:**
  1. **Indexed Search:** Text and compound indexes (`{ name: 'text', specialization: 'text' }` and `{ assignedDoctorId: 1, registrationDate: -1 }`) ensure search queries execute in logarithmic time $O(\log n)$.
  2. **Aggregation Pipelines:** The `/api/dashboard/stats` endpoint leverages native `$lookup` and `$group` pipelines to calculate physician patient loads on the database engine, returning a payload size of $< 2\text{ KB}$ regardless of database record volume.

---

## 5. Visual Evidence

| View Description | Features Represented |
|---|---|
| **Executive Dashboard** | Metric summary cards, physician capacity bar charts, condition distribution visualizations, and rapid triage shortcuts. |
| **Physicians Directory** | Multi-keyword search, specialty dropdown filter, date created range, and direct patient count indicators. |
| **Physician Profile & Roster** | Detailed physician metadata, active patient roster, one-click assignment, and safe unassignment workflows. |
| **Patient Management Desk** | Complete patient records, condition badges, assigned doctor quick-links, and paginated data table. |
| **Authentication Flow** | Form validation, password visibility toggle, session tokens, and automated redirect guards. |

---

## 6. REST API Reference

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/doctors` | Paginated list of physicians | `page`, `limit`, `search`, `specialization`, `hospital` |
| `POST` | `/api/doctors` | Register a new physician | Request body: `{ name, specialization, hospital, phone, email }` |
| `GET` | `/api/doctors/:id` | Fetch physician details & assigned patients | Route param: `id` |
| `PUT` | `/api/doctors/:id` | Update physician information | Route param: `id`, updated JSON body |
| `DELETE` | `/api/doctors/:id` | Delete doctor & unassign associated patients | Route param: `id` |
| `GET` | `/api/patients` | Paginated list of registered patients | `page`, `limit`, `search`, `condition`, `doctorId` |
| `POST` | `/api/patients` | Register a new patient profile | Request body: `{ fullName, phone, condition, assignedDoctorId, ... }` |
| `GET` | `/api/patients/:id` | Retrieve patient record with physician profile | Route param: `id` |
| `PUT` | `/api/patients/:id` | Update patient record or change doctor assignment | Route param: `id`, updated JSON body |
| `DELETE` | `/api/patients/:id` | Permanently delete a patient record | Route param: `id` |
| `GET` | `/api/dashboard/stats` | Aggregated metrics for analytics graphs | None |

---

## 7. License

This project is licensed under the [MIT License](LICENSE).
