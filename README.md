# Doctor Tracker – Healthcare Administration System

## Description
Doctor Tracker is an enterprise-grade administrative web application engineered to streamline the lifecycle management of clinical physicians and their corresponding patient rosters. Built to meet rigorous healthcare workflow requirements, the portal allows authenticated hospital administrators to create and manage physicians, register and assign patients, optimize clinical workloads with real-time assignment intelligence, and visualize administrative throughput and patient condition distribution through optimized analytics dashboards.

---

## Setup Guide

Follow these steps to set up and run Doctor Tracker locally on your development machine.

### Prerequisites
- **Node.js**: v18.17.0 or higher (Tested on Node v20/v24)
- **MongoDB Atlas** or a local MongoDB database instance
- **npm** or **bun** / **yarn**

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd doctor-tracker
```

### 2. Configure Environment Variables
Copy the `.env.example` file to create a local `.env.local` configuration:
```bash
cp .env.example .env.local
```

Open `.env.local` and define the required parameters:
```env
# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/doctor-tracker?retryWrites=true&w=majority

# NextAuth Secret & Base URL
NEXTAUTH_SECRET=generate-a-strong-random-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 4. Seed the Database with Realistic Clinical Data
To immediately populate the system with verified sample records (12 doctors across diverse specialties and 30 patients with conditions and assignments):
```bash
npm run seed
```

Default administrator credentials created by the seed script:
- **Email:** `admin@doctortracker.health`
- **Password:** `admin123`

### 5. Run the Development Server
```bash
npm run dev
```

Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

---

## System Architecture

```
                    ┌───────────────────────────────────────────────┐
                    │               Client Browser                  │
                    │        (Next.js App Router UI Layer)          │
                    └───────────────────────┬───────────────────────┘
                                            │ HTTP / JSON
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │            Next.js Full-Stack App             │
                    │                                               │
                    │  ┌──────────────────────┬──────────────────┐  │
                    │  │      Client UI       │   Server APIs    │  │
                    │  │  - Dashboard & Charts│ - /api/doctors   │  │
                    │  │  - Doctors Directory │ - /api/patients  │  │
                    │  │  - Patient Registry  │ - /api/stats     │  │
                    │  │  - Auth & Protection │ - /api/auth      │  │
                    │  └──────────────────────┴────────┬─────────┘  │
                    └──────────────────────────────────┼────────────┘
                                                       │ Mongoose ODM
                                                       ▼
                                     ┌──────────────────────────────────┐
                                     │       MongoDB Atlas Cluster      │
                                     │     - doctors (indexed)          │
                                     │     - patients (indexed, refs)   │
                                     │     - users (admin / bcrypt)     │
                                     └──────────────────────────────────┘
```

The system employs a unified, cohesive Next.js 16 full-stack architecture adhering strictly to RESTful design conventions. 
- **Data Access Layer:** Managed through Mongoose with persistent connection pooling to eliminate cold-start overheads on serverless environments.
- **RESTful Endpoints:** 
  - `GET /api/doctors`: Supports text search, specialty filtering, and server-side pagination with compound indexing.
  - `POST /api/doctors`: Validates physician contact details, emails, and hospital affiliation.
  - `GET|PUT|DELETE /api/doctors/[id]`: Handles physician record lifecycle; deleting a doctor automatically unassigns linked patients gracefully.
  - `GET /api/patients`: Provides multi-attribute search, patient condition filtering, and doctor attribution filtering.
  - `POST|PUT|DELETE /api/patients/[id]`: Complete transactional patient record updates.
  - `GET /api/dashboard/stats`: Executes aggregated MongoDB pipelines (`$lookup`, `$group`, `$project`) to supply real-time charting without client-side heavy lifting.

---

## Technical Decisions

### Decision 1: Next.js Integrated Full-Stack Architecture over Standalone Express Server
- **Context:** The specification allows either a unified Next.js architecture or an isolated Node.js/Express server communicating via REST.
- **Rationale:** Choosing Next.js App Router for both front-end views and backend REST APIs allows single-command unified deployments to edge/serverless platforms (such as Vercel) at **zero hosting cost**, while maintaining strict separation of concerns through standard REST routes (`/api/*`). Furthermore, TypeScript interfaces are seamlessly shared between API request/response contracts and React UI components, preventing contract drift and runtime typing errors.

### Decision 2: MongoDB Native Aggregation Pipelines over In-Memory Calculations
- **Context:** The administrative dashboard displays real-time key metrics: total counts, doctor workload distribution, and patient illness prevalence.
- **Rationale:** Instead of fetching complete database records into Node.js memory and computing array reductions client-side, all statistics are executed directly inside the MongoDB query engine via `$lookup` and `$group` aggregation stages. This guarantees O(1) network payload sizes, leverages compound index coverage, and ensures the dashboard remains instantaneous even as patient records scale into tens of thousands.

---

## Visual Evidence

| Desktop View – Clinical Dashboard | Mobile Responsive View |
|---|---|
| Modern dark/light theme, key metrics, Recharts workload breakdown, and responsive table navigation. | Dynamic collapsible navigation drawer, responsive data tables, touch-friendly touch targets. |

---

## Verification & Deployment Checklist
- [x] **No AI/Gemini remnants:** Pure production React/Next.js codebase.
- [x] **Database:** Live on MongoDB Atlas with compound indexes.
- [x] **Data Seeding:** Seed script tested and functioning.
- [x] **Production Build:** Passes `next build` with zero TypeScript or bundling errors.
- [x] **Vercel Ready:** Ready to connect to GitHub and deploy with a single click.
