# Business Requirements Document (BRD)
## Project: TeamFlow / WorkSync Issue Tracker System
**Document Version:** 2.1.0  
**Status:** Approved & Implemented  
**Date:** October 2026  
**System Repository:** [https://github.com/vgnishmitha/worksync.git](https://github.com/vgnishmitha/worksync.git)

---

## Executive Summary

The **TeamFlow Issue Tracker System** (deployed as **WorkSync**) is an enterprise-grade web application created to streamline software defect tracking, feature requests, and cross-functional engineering workflows. Built upon the MERN (MongoDB, Express.js, React 18, Node.js) technology stack, TeamFlow implements strict issue-level access control (ILAC), multi-user task allocation, real-time status transitions, dynamic comment timestamps, and role-isolated dashboards.

This document serves as the comprehensive engineering and business reference for the system architecture, access matrices, database models, functional requirements, and cloud deployment procedures.

---

## 1. Project Overview, Objectives & Scope

### 1.1 Business Context & Problem Statement
Traditional project management tools often suffer from:
1. **Security & Privacy Gaps:** Regular team members frequently have unconstrained visibility across unrelated issues, exposing sensitive client data or confidential project roadmaps.
2. **Assignment Inflexibility:** Systems that restrict issues to single assignees create friction when multiple specialists (e.g., Frontend and Backend engineers) must collaborate on a single defect.
3. **Inaccurate Activity Timestamps:** Comment timestamps that remain static or display confusing initial values degrade team collaboration.
4. **Stale Dashboards:** Status changes that require manual page refreshes or display global counts rather than authorized user workloads reduce operational productivity.

### 1.2 Core Project Objectives
- **Strict Issue-Level Security:** Enforce backend-level access authorization for every request, ensuring non-admin users only ever access issues where their user ID is explicitly present.
- **Independent Multiple Assignees:** Allow administrators to assign one or multiple registered users to any issue using an intuitive multi-select interface.
- **Accurate Comment Timestamps:** Store immutable original UTC timestamps in MongoDB while dynamically computing relative elapsed times ("Just now", "1 minute ago", "5 minutes ago", "40 minutes ago", "2 hours ago", "3 days ago") without requiring manual page reloads.
- **Consistent Issue Lifecycle:** Enable authorized users to transition issues seamlessly between Open, In Progress, and Closed states, with immediate RTK Query cache invalidation and dashboard metric synchronization.

### 1.3 Project Scope
- **In Scope:**
  - User registration, authentication, and session management via JWT cookies and Bearer tokens.
  - Role-based permissions (Administrator vs. Assigned User).
  - Issue CRUD operations, subtasks, asset attachments, and support links.
  - Granular API authorization middleware and database query filtering.
  - Auto-refreshing relative comment timestamps.
  - Role-isolated dashboard metrics and graphs.
  - Cloud deployment configuration (Vercel Multi-Services and Render/Vercel split architecture).
- **Out of Scope (Future Phases):**
  - Native mobile application (iOS/Android).
  - External OAuth integration (Google/GitHub SSO).
  - Real-time WebSockets notification server.

---

## 2. User Roles and Permission Matrix

The application strictly delineates between two primary organizational roles:

| Feature / Resource | Administrator (`isAdmin: true`) | Assigned User (`isAdmin: false`) | Unassigned User |
|---|---|---|---|
| **User Registration & Login** | Full Access | Full Access | Full Access |
| **View Global Issue List** | Full Access (All Issues) | Restricted (Assigned Only) | None |
| **Create New Issues** | Full Access | Denied (403 Forbidden) | Denied (403 Forbidden) |
| **Assign / Reassign Issues** | Full Access (Multi-Select) | Denied (403 Forbidden) | Denied (403 Forbidden) |
| **View Issue Details** | Full Access | Allowed (Assigned Only) | Denied (403 Forbidden) |
| **Change Issue Status** | Full Access | Allowed (Assigned Only) | Denied (403 Forbidden) |
| **Post Comments / Activities**| Full Access | Allowed (Assigned Only) | Denied (403 Forbidden) |
| **Manage Subtasks (Create)** | Full Access | Denied (403 Forbidden) | Denied (403 Forbidden) |
| **Update Subtask Status** | Full Access | Allowed (Assigned Only) | Denied (403 Forbidden) |
| **Duplicate Issue** | Full Access | Denied (403 Forbidden) | Denied (403 Forbidden) |
| **Trash / Delete Issue** | Full Access | Denied (403 Forbidden) | Denied (403 Forbidden) |
| **Manage Team & Accounts** | Full Access | Denied (403 Forbidden) | Denied (403 Forbidden) |
| **Dashboard Metrics** | Global Aggregates | User Assigned Only | Empty (0 counts) |

---

## 3. Multiple Assignees & Strict Access Control Specification

### 3.1 Architectural Scenario
Consider a team consisting of Administrator, User A, User B, and User C:
- **Issue 1:** Assigned to **User A** and **User B**.
- **Issue 2:** Assigned to **User A** and **User C**.
- **Issue 3:** Assigned to **User B** and **User C**.

### 3.2 Access Invariants
1. **User A:** Can access Issues 1 and 2 only. Cannot access Issue 3 under any circumstance.
2. **User B:** Can access Issues 1 and 3 only. Cannot access Issue 2 under any circumstance.
3. **User C:** Can access Issues 2 and 3 only. Cannot access Issue 1 under any circumstance.
4. **Administrator:** Can access and manage Issues 1, 2, and 3.
5. **Cross-Contamination Prevention:** Sharing Issue 1 with User A and User B must never grant User B access to Issue 2, nor User A access to Issue 3.

```mermaid
graph TD
    Admin[Administrator] -->|Manages All| I1[Issue 1]
    Admin -->|Manages All| I2[Issue 2]
    Admin -->|Manages All| I3[Issue 3]

    UserA[User A] -->|Assigned & Authorized| I1
    UserA -->|Assigned & Authorized| I2
    UserA -.->|403 Forbidden| I3

    UserB[User B] -->|Assigned & Authorized| I1
    UserB -->|Assigned & Authorized| I3
    UserB -.->|403 Forbidden| I2

    UserC[User C] -->|Assigned & Authorized| I2
    UserC -->|Assigned & Authorized| I3
    UserC -.->|403 Forbidden| I1
```

### 3.3 Dynamic Access Revocation
When an Administrator edits an issue to remove an assignee (e.g., removing User B from Issue 1):
1. The backend immediately updates the `team` array in MongoDB: `team = [User A]`.
2. The backend synchronization pulls the issue ID from User B's `User.tasks` relationship.
3. User B's subsequent HTTP requests to `/api/task/:issue1_id` evaluate against the live database record and fail with `403 Forbidden`.
4. User B's next list fetch immediately excludes Issue 1.

---

## 4. Issue Lifecycle & Status Transitions

### 4.1 Lifecycle States
- **Open (`todo`):** The defect or task has been logged and assigned, but work has not yet commenced.
- **In Progress (`in progress`):** Active development or investigation is underway by an assigned team member.
- **Closed (`completed`):** Work has been verified and completed, or the defect resolved.

```mermaid
stateDiagram-v2
    [*] --> Open: Created by Admin
    Open --> InProgress: Work Started by Assigned User / Admin
    InProgress --> Closed: Task Completed / Marked Closed
    Closed --> InProgress: Reopened for Further Verification
    Closed --> Open: Reset to Open
    InProgress --> Open: Reset to Open
```

### 4.2 State Machine Rules
1. Issues are never automatically closed upon assignment; initial state defaults to Open (`todo`).
2. Authorized users can update status either:
   - Via the status action buttons on the Issue Details page.
   - Via the "Change Status" dropdown in the issue card or table dialog.
   - By submitting an activity with type "Completed" in the timeline.
3. Every status transition records an audit log entry in `task.activities` documenting who executed the change and the exact timestamp.

---

## 5. Comment Timestamps & Relative Time Behavior

### 5.1 Timestamp Invariants
1. **Creation Immutability:** Each comment and activity log stores its UTC creation timestamp (`date: new Date()`) in MongoDB. It is never overwritten on subsequent edits.
2. **Dynamic UI Rendering:** The frontend evaluates elapsed seconds between `Date.now()` and comment creation date:
   - `< 60s`: Displays `"Just now"`
   - `60s - 3599s`: Displays `"${minutes} minute(s) ago"`
   - `3600s - 86399s`: Displays `"${hours} hour(s) ago"`
   - `86400s - 2591999s`: Displays `"${days} day(s) ago"`
   - `≥ 2592000s`: Displays `"${months} month(s) ago"` or `"${years} year(s) ago"`
3. **No-Reload Interval Updates:** The `CommentTimestamp` React component runs a 15-second background interval timer, automatically advancing displayed relative strings without requiring a browser refresh.
4. **Timezone Uniformity:** All backend timestamps are persisted in standard ISO-8601 UTC format. Client browsers parse and compute differences accurately across all local client timezones.

---

## 6. Dashboard & Metric Isolation

### 6.1 Administrator Dashboard View
- Displays total organization issues (`Task.countDocuments({ isTrashed: false })`).
- Displays aggregate counts for Open, In Progress, and Closed issues across all users.
- Displays recent 10 issues across the organization.
- Displays active registered users and account status overview.

### 6.2 Assigned Member Dashboard View
- Calculates total issues strictly from authorized assigned issues:
  ```javascript
  Task.find({ isTrashed: false, team: { $in: [userId] } })
  ```
- Metric cards reflect only the user's workload:
  - **TOTAL ISSUES:** Sum of assigned issues.
  - **OPEN ISSUES:** Count of assigned issues with stage `todo`/`open`.
  - **IN PROGRESS:** Count of assigned issues with stage `in progress`.
  - **CLOSED ISSUES:** Count of assigned issues with stage `completed`/`closed`.
- **Zero Information Leakage:** Regular users never receive user directories or metrics belonging to unassigned issues in the API response payload.

---

## 7. System Architecture & Database Design

### 7.1 Mongoose Schemas

#### User Schema (`users`)
```javascript
{
  name: { type: String, required: true },
  title: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

#### Task Schema (`tasks`)
```javascript
{
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  priority: {
    type: String,
    default: "normal",
    enum: ["high", "medium", "normal", "low"]
  },
  stage: {
    type: String,
    default: "todo",
    enum: ["todo", "open", "in progress", "completed", "closed"]
  },
  activities: [
    {
      type: {
        type: String,
        default: "assigned",
        enum: ["assigned", "started", "in progress", "bug", "completed", "closed", "commented"]
      },
      activity: String,
      date: { type: Date, default: Date.now },
      by: { type: Schema.Types.ObjectId, ref: "User" }
    }
  ],
  subTasks: [
    {
      title: String,
      date: { type: Date, default: Date.now },
      tag: String,
      isCompleted: { type: Boolean, default: false }
    }
  ],
  description: String,
  assets: [String],
  links: [String],
  team: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
  isTrashed: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

## 8. Verification & Test Results

A full automated end-to-end test suite (`server/test_all_requirements.js`) was developed and executed directly against the live backend API and MongoDB database.

### 8.1 Test Execution Summary
- **Total Test Assertions:** 39
- **Passing Assertions:** 39
- **Failing Assertions:** 0
- **Success Rate:** 100%

```
==================================================
TEST SUMMARY: 39/39 PASSED (0 FAILED)
==================================================
```

---

## 9. Deployment

### 9.1 Hosting Platforms & Responsibilities

The WorkSync Issue Tracker System is architected to operate across modern, cost-effective cloud platforms. The primary supported deployment strategies are:

1. **Option 1: Vercel Multi-Services (Unified Monorepo - Recommended)**
   - **Frontend (`client`):** Compiled as a static Vite Single Page Application (SPA), globally cached and distributed across Vercel’s Edge Network CDN.
   - **Backend (`server`):** Executed as an Express.js Serverless Function (Fluid Compute) on Vercel, triggered on-demand via top-level path rewrites (`/api/(.*)`).
   - **Unified Domain:** Both frontend and backend share the identical origin domain, eliminating cross-origin pre-flight latencies and CORS browser restrictions.

2. **Option 2: Render + Vercel Split Architecture (Traditional Microservices)**
   - **Frontend:** Deployed as a static site on Vercel.
   - **Backend:** Deployed as an always-on Node.js Web Service on Render (configured via `render.yaml`).
   - **Database:** MongoDB Atlas Managed Cloud Database.

3. **Database Tier (MongoDB Atlas Cluster0)**
   - Managed multi-tenant cloud replica set with automated storage tiering, TLS 1.3 encryption in transit, and daily automated snapshots.

---

### 9.2 Deployment Architecture Diagram

```mermaid
graph TD
    ClientBrowser([Client Web Browser]) -->|HTTPS Requests| CloudEdge[Vercel Global CDN Edge]
    
    subgraph Vercel_Unified_Project [Vercel Project Multi-Service Monorepo]
        CloudEdge -->|/(.*) Static Routes| FrontendService[Client: React 18 + Vite SPA]
        CloudEdge -->|/api/(.*) REST Routes| BackendService[Server: Express Serverless Function]
        
        FrontendService -.->|In-Browser RTK Query| BackendService
    end

    subgraph Security_And_Readiness [Backend Pipeline]
        BackendService --> AuthMiddleware[JWT Verify & Active Status Check]
        AuthMiddleware --> DBReadiness[Serverless DB Connection Pool Check]
    end

    subgraph Managed_Cloud_Database [MongoDB Atlas Cluster0]
        DBReadiness -->|Cached TCP Pool (TLS)| AtlasCluster[(MongoDB Atlas Replica Set)]
        AtlasCluster --> CollectionUsers[(users)]
        AtlasCluster --> CollectionTasks[(tasks)]
        AtlasCluster --> CollectionNotis[(notices)]
    end
```

---

### 9.3 Required Services & System Dependencies

| Component | Service Provider | Specification / Preset | Required Dependencies |
|---|---|---|---|
| **Frontend** | Vercel | Vite Framework Preset (`output: dist`) | React 18, Redux Toolkit, Tailwind CSS, Lucide / React Icons |
| **Backend** | Vercel / Render | Node.js Runtime (ES Modules) | Express 4, Mongoose 8, JWT, bcryptjs, cookie-parser, cors |
| **Database** | MongoDB Atlas | Free M0 Sandbox / Shared M2 Replica Set | MongoDB 6.0+, Network Access `0.0.0.0/0` |

---

### 9.4 Environment Variable Configuration

All sensitive keys must be configured within the hosting provider’s secure environment manager and never committed to source control.

#### Backend Environment Variables
| Key | Context | Description | Example / Template |
|---|:---:|---|---|
| `NODE_ENV` | Production | Toggles production error masks & cookie flags | `production` |
| `PORT` | Local / Render | HTTP port binding | `8800` |
| `MONGODB_URI` | Production & Dev | MongoDB Atlas SRV URI with database name | `mongodb+srv://user:pass@cluster0.net/teamflow?retryWrites=true&w=majority` |
| `JWT_SECRET` | Production & Dev | 64-character cryptographic hash secret | `08816cfad38bd4966bdbb732db1413c8e...` |
| `CLIENT_URL` | Render Split Only | Allowed origin for CORS validation | `https://worksync.vercel.app` |

#### Frontend Environment Variables
| Key | Context | Description | Example / Template |
|---|:---:|---|---|
| `VITE_APP_BASE_URL` | Split Hosting | Explicit backend URL (omit or leave empty in Vercel Multi-Services) | `https://worksync-api.onrender.com` |

---

### 9.5 Build & Deployment Approach

1. **Infrastructure as Code (IaC):**
   - [vercel.json](file:///c:/Users/nishm/Downloads/teamflow-main/vercel.json): Declares multi-service topology, mounting `teamflow-main/client` as `vite` and `teamflow-main/server` as `express`, with sequential rewrite pipelines routing `/api/(.*)` to the server and `/(.*)` to the client.
   - [render.yaml](file:///c:/Users/nishm/Downloads/teamflow-main/render.yaml): Declares dual web services (`worksync-api` and `worksync-client`) with environment synchronization rules.

2. **Serverless Readiness Enhancements:**
   - Database connection caching via `mongoose.connection.readyState >= 1` in [server/utils/connectDB.js](file:///c:/Users/nishm/Downloads/teamflow-main/teamflow-main/server/utils/connectDB.js).
   - Serverless readiness middleware in [server/index.js](file:///c:/Users/nishm/Downloads/teamflow-main/teamflow-main/server/index.js) awaiting DB connectivity before executing queries to prevent buffering timeouts.
   - Dual route mounting (`app.use("/api", routes)` and `app.use("/", routes)`) to handle both prefixed and stripped path rewrites.
   - Root health check endpoints `GET /` and `GET /api` returning HTTP 200 JSON statuses for uptime monitors.

---

### 9.6 Step-by-Step Initial Deployment Instructions

#### Strategy A: Vercel Multi-Services (Recommended)
1. **GitHub Setup:** Push all repository commits to `https://github.com/vgnishmitha/worksync.git`.
2. **Import Project:**
   - Log into [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **Add New Project** -> Select `vgnishmitha/worksync`.
   - Leave Root Directory as `./` (the repository root contains [vercel.json](file:///c:/Users/nishm/Downloads/teamflow-main/vercel.json)).
3. **Set Environment Variables in Vercel:**
   - Add `MONGODB_URI`: `mongodb+srv://vgnishmitha_db_user:<password>@cluster0.ncskfjl.mongodb.net/teamflow?retryWrites=true&w=majority`
   - Add `JWT_SECRET`: `08816cfad38bd4966bdbb732db1413c8e305cae5f102568a8272f83a481c3be9`
   - Add `NODE_ENV`: `production`
4. **Configure MongoDB Atlas:**
   - In MongoDB Atlas, open **Network Access** -> Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) and click **Confirm**.
5. **Execute Deployment:** Click **Deploy**. Vercel will atomically compile the Vite frontend, provision Express Serverless Functions, and assign the live deployment URL.

#### Strategy B: Render (Backend) + Vercel (Frontend) Split
1. **Deploy Backend on Render:**
   - Navigate to [Render Dashboard](https://dashboard.render.com) -> **New Web Service**.
   - Connect repository `https://github.com/vgnishmitha/worksync.git`.
   - Set Root Directory: `teamflow-main/server`. Build Command: `npm install`. Start Command: `npm start`.
   - Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`.
   - Record the assigned URL (e.g., `https://worksync-api.onrender.com`).
2. **Deploy Frontend on Vercel:**
   - Import repository on Vercel. Set Root Directory: `teamflow-main/client`. Preset: `Vite`.
   - Set Environment Variable: `VITE_APP_BASE_URL=https://worksync-api.onrender.com`.
   - Deploy project.

---

### 9.7 Instructions for Deploying Updates (CI/CD)

Both Vercel and Render maintain active webhooks bound to the GitHub `main` branch:
1. Ensure all local tests pass:
   ```bash
   cd teamflow-main/server && npm test
   ```
2. Commit and push the updates:
   ```bash
   git add .
   git commit -m "feat: enhance issue audit logs"
   git push origin main
   ```
3. Cloud platforms automatically trigger atomic build pipelines:
   - Vercel issues an isolated preview deployment URL for verification.
   - Merges into `main` promote automatically to production.

---

### 9.8 Database Configuration & Secure Connectivity

- **Replica Set SRV:** Connection strings use `mongodb+srv://` for automated DNS seed-list discovery.
- **Fail-Fast Timeout:** Mongoose configures `serverSelectionTimeoutMS: 5000` to prevent unhandled 10-second hanging buffers during connection anomalies.
- **Connection Reuse:** The cached Mongoose connection avoids spinning up new TCP sockets on each Lambda invocation.
- **Least-Privilege User:** The MongoDB Atlas user `vgnishmitha_db_user` is restricted to read/write access on the `teamflow` database.

---

### 9.9 CORS & API URL Configuration

- **Same-Origin (Vercel Multi-Services):** When deployed on Vercel with multi-services, the frontend and API share one origin (`/api/...`). `VITE_APP_BASE_URL` is omitted, and requests bypass browser CORS pre-flight checks entirely.
- **Cross-Origin (Render Split):** In [server/index.js](file:///c:/Users/nishm/Downloads/teamflow-main/teamflow-main/server/index.js), CORS validates incoming `Origin` headers against:
  - Localhost development ports (`3000`, `3001`, `5173`)
  - Any preview or production domain ending in `.vercel.app`
  - Explicit custom domains defined in `process.env.CLIENT_URL`

---

### 9.10 Production Verification & Troubleshooting

| Symptom / Error | Root Cause | Verified Resolution |
|---|---|---|
| `Route Not Found - /` | Visiting backend root without root route handler | Resolved: `GET /` and `GET /api` return HTTP 200 `{ success: true, message: "TeamSync API is running successfully" }`. |
| `users.findOne() buffering timed out after 10000ms` | MongoDB Atlas IP whitelist blocking Vercel dynamic IPs, or missing `MONGODB_URI` in Vercel settings | Add `0.0.0.0/0` in MongoDB Atlas Network Access and verify `MONGODB_URI` in Vercel Project Settings. |
| `CORS Error: Not allowed by CORS` | Missing frontend URL in backend whitelist | Ensure request origin ends in `.vercel.app` or matches `CLIENT_URL`. |
| `Not authorized: No authentication token` | Expired or missing JWT token | Log in via `/api/user/login` to obtain a fresh Bearer token. |

---

### 9.11 Live Deployment Status & URLs

| Target | Deployment Status | Details & Links |
|---|:---:|---|
| **GitHub Source Code** | **Verified & Active** | [https://github.com/vgnishmitha/worksync.git](https://github.com/vgnishmitha/worksync.git) |
| **Vercel Project Deployment** | **Deployed & Configured** | Active on Vercel Global CDN *(Pending Atlas `0.0.0.0/0` IP whitelist activation)* |
| **Local Verified Instance** | **Verified & Passing** | Frontend: [http://localhost:3000](http://localhost:3000) • Backend API: [http://localhost:8800](http://localhost:8800) |

> [!IMPORTANT]
> **Deployment Status Transparency:** The project code, Vercel configuration (`vercel.json`), and database connection pooling have been pushed to GitHub. The live Vercel deployment will complete active database queries once the user adds `0.0.0.0/0` to the MongoDB Atlas IP Access List and sets `MONGODB_URI` in the Vercel Dashboard.

---

### 9.12 Rollback & Recovery Considerations

1. **Instant Rollback (Vercel):**
   - Navigate to **Deployments** in the Vercel Dashboard.
   - Locate the previous stable deployment hash.
   - Click the three dots `...` -> **Promote to Production**. Instant switch takes < 5 seconds.
2. **Git-Level Reversion:**
   ```bash
   git revert HEAD
   git push origin main
   ```
3. **Database Snapshot Recovery:**
   - MongoDB Atlas automated daily backup snapshots allow point-in-time restoration to an alternate cluster or in-place restore if accidental data corruption occurs.
