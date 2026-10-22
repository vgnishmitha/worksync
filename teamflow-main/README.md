# 🔷 WorkSync / TeamFlow — Enterprise Issue Tracker System

<div align="center">

![WorkSync Banner](https://img.shields.io/badge/WorkSync-Issue_Tracker_System-0284c7?style=for-the-badge&logo=checkmarx&logoColor=white)
![MERN Stack](https://img.shields.io/badge/Stack-MongoDB_%7C_Express_%7C_React_%7C_Node.js-2563eb?style=for-the-badge&logo=react&logoColor=white)
![Build Status](https://img.shields.io/badge/Build-Passing-0ea5e9?style=for-the-badge&logo=githubactions&logoColor=white)
![Test Coverage](https://img.shields.io/badge/Tests-39%2F39_Passing-1d4ed8?style=for-the-badge&logo=jest&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-0369a1?style=for-the-badge)

<p align="center">
  <b>A modern, role-aware defect tracking and agile workflow coordination platform built with the MERN stack.</b><br/>
  Featuring strict Issue-Level Access Control (ILAC), multi-engineer assignment, real-time status transitions, dynamic relative comment timestamps, and isolated personal dashboards.
</p>

[Explore System Architecture](#10-system-architecture-and-mermaid-diagram) •
[API Reference](#15-api-documentation) •
[Manual Testing Matrix](#16-manual-testing-checklist-and-verified-results) •
[Deployment Guide](#18-deployment-architecture-and-instructions)

---

</div>

## 📑 Table of Contents

1. [Project Title and Introduction](#1-project-title-and-introduction)
2. [Project Overview and Objectives](#2-project-overview-and-objectives)
3. [Features Implemented](#3-features-implemented)
4. [User Roles: Admin and Regular Users](#4-user-roles-admin-and-regular-users)
5. [Issue Management Workflow](#5-issue-management-workflow)
6. [Issue Assignment and Role-Based Access Control](#6-issue-assignment-and-role-based-access-control)
7. [Issue Statuses: Open, In Progress, Closed](#7-issue-statuses-open-in-progress-closed)
8. [Dashboard and Statistics](#8-dashboard-and-statistics)
9. [Technology Stack](#9-technology-stack)
10. [System Architecture and Mermaid Diagram](#10-system-architecture-and-mermaid-diagram)
11. [Project Folder Structure](#11-project-folder-structure)
12. [Database Models and Relationships](#12-database-models-and-relationships)
13. [Prerequisites and Installation Instructions](#13-prerequisites-and-installation-instructions)
14. [Environment Variables](#14-environment-variables)
15. [API Documentation](#15-api-documentation)
16. [Manual Testing Checklist and Verified Results](#16-manual-testing-checklist-and-verified-results)
17. [Known Issues and Limitations](#17-known-issues-and-limitations)
18. [Deployment Architecture and Instructions](#18-deployment-architecture-and-instructions)
19. [Live Deployment URL](#19-live-deployment-url)
20. [Future Enhancements](#20-future-enhancements)
21. [Repository and Author Information](#21-repository-and-author-information)

---

## 1. Project Title and Introduction

### 🔹 WorkSync / TeamFlow Issue Tracker System
**WorkSync** (internally designated as *TeamFlow*) is a production-grade software defect and task tracking application designed for engineering squads and cross-functional product teams. Built on the **MERN** stack (**MongoDB, Express.js, React 18 with Vite, Node.js**), the platform solves fundamental privacy, collaboration, and visibility shortcomings common in generic task boards.

> [!NOTE]
> WorkSync implements **Issue-Level Access Control (ILAC)** enforced at the database query layer, dynamic multi-user issue allocations, live relative activity timestamps, and dual-mode production deployment (Vercel Multi-Services and Render/Vercel split architecture).

---

## 2. Project Overview and Objectives

### 2.1 The Problem
In distributed agile teams, conventional task trackers exhibit critical design deficiencies:
- **Overexposure of Confidential Work:** Regular team members frequently inherit global visibility across all tickets, exposing proprietary customer data, sensitive billing bugs, or unreleased feature specifications.
- **Single-Assignee Bottlenecks:** Tasks frequently require joint execution (e.g., a frontend engineer and a backend engineer collaborating on a payment checkout bug). Single-assignee systems force artificial ticket duplication or offline coordination.
- **Stale Timestamps & Manual Page Reloads:** Static activity logs confuse team members regarding whether a response was posted seconds ago or days ago.
- **Global Metric Contamination:** Dashboards that aggregate global organization numbers prevent individual contributors from accurately tracking their immediate workload.

### 2.2 Core System Objectives
| Objective | Implementation Strategy | Business Outcome |
|---|---|---|
| **Issue-Level Privacy** | MongoDB query filtering (`team: { $in: [userId] }`) on all user endpoints | Complete multi-tenant privacy within single organizations |
| **Flexible Allocation** | Unconstrained `team: [ObjectId]` array with multi-select UI | Seamless cross-disciplinary engineering handoffs |
| **Dynamic Timestamps** | ISO UTC storage in MongoDB with client-side 15s relative interval re-evaluation | Real-time visibility into recent team responses |
| **Instant Cache Invalidation** | Redux Toolkit Query automated tag invalidation (`Task`, `Dashboard`) | Instant UI metric updates without manual browser refresh |
| **Cloud-Ready Resilience** | Serverless MongoDB connection caching and unified Vercel/Render descriptors | Zero-configuration auto-scaling in production |

---

## 3. Features Implemented

### 🛡️ Security & Authentication
- **Dual-Token Authentication:** Supports standard `Authorization: Bearer <token>` HTTP headers and secure HTTP-Only session cookies.
- **Password Protection:** Irreversible bcrypt hashing with automated salt generation.
- **Account State Verification:** Immediate access termination for deactivated accounts via database status interrogation on every protected route.

### 📋 Issue Lifecycle & Defect Tracking
- **Complete Issue CRUD:** Full lifecycle management including title, description, priority (`low`, `normal`, `medium`, `high`), stage (`todo`, `in progress`, `completed`), deadline, subtasks, and assets.
- **Multi-Assignee Support:** Assign single or multiple engineers to any issue simultaneously.
- **Immediate Access Revocation:** Removing an assignee instantly strips their access to the issue across detail views, comments, and status endpoints.
- **Subtask Checklists:** Granular item execution with interactive completion toggles.
- **Soft Deletion & Trash Bin:** Admin-restricted recycle bin with restore and permanent purge capabilities.

### 💬 Activity Logs & Relative Timestamps
- **Chronological Audit Trail:** Activity entries record action type (`commented`, `started`, `in progress`, `bug`, `completed`), author reference, and ISO UTC creation timestamp.
- **Auto-Refreshing Timestamps:** Relative time display ("Just now", "5 minutes ago", "2 hours ago") re-evaluates automatically every 15 seconds without triggering API requests or page reloads.

### 📊 Role-Isolated Dashboards
- **Metric Cards:** Visual counters for Total Issues, Completed, In Progress, and Open.
- **Access Isolation:** Regular users view counters computed **strictly from their assigned tickets**; administrators view organization-wide metrics.
- **Interactive Visualizations:** Priority breakdown charts and recent activity distribution graphs powered by Recharts.

---

## 4. User Roles: Admin and Regular Users

The platform implements strict Role-Based Access Control (RBAC) delineated by the `isAdmin` boolean flag on the authenticated user profile:

```
                  ┌─────────────────────────────────────────┐
                  │          Authenticated User             │
                  └────────────────────┬────────────────────┘
                                       │
                    Is user flagged as Administrator?
                                       │
                     ┌─────────────────┴─────────────────┐
                    YES                                 NO
                     ▼                                   ▼
         ┌───────────────────────┐           ┌───────────────────────┐
         │     Administrator     │           │     Regular User      │
         └───────────┬───────────┘           └───────────┬───────────┘
                     │                                   │
      • Create / Edit / Delete Issues     • View assigned issues ONLY
      • Assign / Reassign team members    • Update assigned issue stage
      • Manage Users & Team Roster        • Post comments on assigned issues
      • Access Full Organization Metrics  • View personal dashboard metrics
```

### Detailed Permission Matrix

| Operation / Capability | Administrator (`isAdmin: true`) | Regular User (`isAdmin: false`) | Unauthenticated Visitor |
|---|:---:|:---:|:---:|
| **Register & Login** | ✅ Full Access | ✅ Full Access | ✅ Allowed |
| **View Global Issue List** | ✅ All Issues | ❌ Denied (`403` / Filtered) | ❌ Denied (`401`) |
| **View Assigned Issues** | ✅ All Issues | ✅ Assigned Only | ❌ Denied (`401`) |
| **Create New Issues** | ✅ Full Access | ❌ Denied (`403 Forbidden`) | ❌ Denied (`401`) |
| **Edit Issue Details & Team** | ✅ Full Access | ❌ Denied (`403 Forbidden`) | ❌ Denied (`401`) |
| **Change Assigned Issue Status** | ✅ Full Access | ✅ Assigned Issues Only | ❌ Denied (`401`) |
| **Post Comments / Activities** | ✅ Any Issue | ✅ Assigned Issues Only | ❌ Denied (`401`) |
| **Trash / Restore Issues** | ✅ Full Access | ❌ Denied (`403 Forbidden`) | ❌ Denied (`401`) |
| **Permanently Delete Issues** | ✅ Full Access | ❌ Denied (`403 Forbidden`) | ❌ Denied (`401`) |
| **Team Management (Roster)** | ✅ Full Access | ❌ Denied (`403 Forbidden`) | ❌ Denied (`401`) |
| **Activate / Deactivate Users** | ✅ Full Access | ❌ Denied (`403 Forbidden`) | ❌ Denied (`401`) |
| **Dashboard Metrics Scope** | 🌐 Organization-Wide | 👤 Personal Assigned Only | ❌ Denied (`401`) |

---

## 5. Issue Management Workflow

```mermaid
stateDiagram-v2
    [*] --> Open: Admin creates issue & assigns engineers
    Open --> In_Progress: Assigned user or Admin starts work
    In_Progress --> Open: Work paused / reverted
    In_Progress --> Closed: Fix verified / task finished
    Closed --> In_Progress: Defect reopened
    Closed --> Trash: Admin moves to recycle bin
    Trash --> Open: Admin restores issue
    Trash --> [*]: Admin permanently deletes issue
```

1. **Creation:** Administrator defines issue parameters (title, description, priority, deadline, team assignees) via the `AddTask` modal dialog.
2. **Assignment:** Selected engineers immediately receive visibility in their personal issue feeds and dashboard counters.
3. **Execution:** Engineers transition the issue to **In Progress**, post activity comments documenting root-cause analysis, and attach reference links or assets.
4. **Completion:** Upon resolution, the issue is moved to **Closed** (`completed`), immediately updating dashboard graphs across all authorized sessions.
5. **Archival:** Deprecated issues can be trashed and purged exclusively by an Administrator.

---

## 6. Issue Assignment and Role-Based Access Control

### 6.1 Multi-Assignee Schema
Issues maintain assignees as an indexed array of MongoDB ObjectIds:
```javascript
// server/models/taskModel.js
team: [{ type: Schema.Types.ObjectId, ref: "User", index: true }]
```

### 6.2 Strict Issue-Level Isolation Enforcement (ILAC)
Security is enforced at the database query layer, ensuring that client-side tampering cannot breach isolation:

```javascript
// server/controllers/taskController.js (getTasks)
const { userId, isAdmin } = req.user;
const query = { isTrashed: false };

if (!isAdmin) {
  // Regular users are strictly restricted to issues where their ID is in team
  query.team = { $in: [userId] };
}
const tasks = await Task.find(query).populate("team", "name title email");
```

```javascript
// server/controllers/taskController.js (getTask detail)
if (!req.user.isAdmin) {
  const isAssignee = task.team.some(
    (memberId) => memberId.toString() === req.user.userId
  );
  if (!isAssignee) {
    return res.status(403).json({
      status: false,
      message: "Forbidden: You are not authorized to access this issue.",
    });
  }
}
```

---

## 7. Issue Statuses: Open, In Progress, Closed

The system schema natively implements three primary production states:

| Display Status | Internal Schema Value | Description & Lifecycle Role |
|---|:---:|---|
| **Open** | `todo` / `open` | Defect logged, triaged, and awaiting active developer pickup. |
| **In Progress** | `in progress` | Defect actively under investigation, debugging, or code review. |
| **Closed** | `completed` / `closed` | Resolution merged, defect resolved, and QA validation finished. |

> [!NOTE]
> **Blocked Status Implementation Note:** In the current production release, issues awaiting third-party dependencies are flagged via the **High Priority** badge and documented via the Activity comment audit log. A formal `blocked` state enum is scheduled for Phase 3 (see [Future Enhancements](#20-future-enhancements)).

---

## 8. Dashboard and Statistics

The WorkSync dashboard delivers immediate operational visibility while preserving data confidentiality:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WORKSYNC METRIC SUMMARY                         │
├────────────────────┬────────────────────┬──────────────────────────────┤
│    TOTAL ISSUES    │     COMPLETED      │         IN PROGRESS          │
│       [ 12 ]       │       [ 5 ]        │            [ 4 ]             │
├────────────────────┴────────────────────┴──────────────────────────────┤
│ 🔹 Admin Session: Reflects 100% of organization tickets                │
│ 🔹 Regular User Session: Filtered strictly to caller's assigned tasks  │
└────────────────────────────────────────────────────────────────────────┘
```

- **Stat Cards:** Display live counts of Total Tasks, Completed Tasks, Tasks In Progress, and Todos.
- **Priority Chart:** Interactive bar chart categorizing workload by High, Medium, Normal, and Low priority tiers.
- **User Privacy:** The `users` collection summary included in the admin dashboard response is completely stripped from regular user dashboard payloads.

---

## 9. Technology Stack

<div align="center">

| Tier | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | **React 18** (Vite bundler) | Component-driven Single Page Application |
| **State Management** | **Redux Toolkit & RTK Query** | Global state, API caching, and automated tag invalidation |
| **CSS & Design** | **Tailwind CSS & Headless UI** | Responsive, modern white-and-blue interface design |
| **Icons & Visuals** | **React Icons & Recharts** | Modern iconography and SVG data visualization |
| **Backend Runtime** | **Node.js (ES Modules)** | Asynchronous, event-driven server runtime |
| **Web Framework** | **Express.js 4** | Modular routing, middleware pipelines, and REST API |
| **Database** | **MongoDB Atlas** | Distributed NoSQL document storage with replica set |
| **ODM Modeling** | **Mongoose 8** | Schema validation, hooks, and query projection |
| **Authentication** | **JSON Web Tokens & bcryptjs** | Stateless Bearer token verification and salted password hashing |
| **Hosting & CI/CD** | **Vercel & Render** | Serverless function compute and automated Git deployments |

</div>

---

## 10. System Architecture and Mermaid Diagram

```mermaid
graph TD
    User([Client Web Browser]) -->|HTTPS Request| CDN[Vercel Global Edge Network]
    
    subgraph Vercel_Platform [Vercel Project Platform]
        CDN -->|/(.*) Static SPA| ViteClient[Vite React Client App]
        CDN -->|/api/(.*) API Calls| ExpressServerless[Express Serverless Functions]
        
        ViteClient -->|RTK Query Fetch| ExpressServerless
    end
    
    subgraph Security_Layer [Backend Middleware Pipeline]
        ExpressServerless --> CORS[CORS Validation]
        CORS --> AuthMW[authMiddleware: JWT Verify]
        AuthMW --> DBMiddleware[Database Readiness Middleware]
    end
    
    subgraph Data_Persistence [Managed Cloud Persistence]
        DBMiddleware -->|Mongoose Pool| Atlas[(MongoDB Atlas Cluster0)]
        Atlas --> UsersCol[(users collection)]
        Atlas --> TasksCol[(tasks collection)]
        Atlas --> NotisCol[(notices collection)]
    end
```

---

## 11. Project Folder Structure

```
teamflow-main/
├── vercel.json                         # Root Vercel multi-service routing descriptor
├── render.yaml                         # Render Infrastructure-as-Code deployment descriptor
├── BRD.md                              # Enterprise Business Requirements Document
├── README.md                           # Master Project Documentation
│
└── teamflow-main/                      # Core Monorepo Directory
    ├── vercel.json                     # Subdirectory Vercel routing fallback
    ├── render.yaml                     # Subdirectory Render descriptor
    │
    ├── client/                         # Frontend Application (React 18 + Vite)
    │   ├── public/                     # Static icons, favicons, assets
    │   ├── src/
    │   │   ├── assets/                 # Component images and static styling
    │   │   ├── components/             # Reusable UI widgets (Navbar, Sidebar, Table, Modal)
    │   │   │   ├── tasks/              # TaskDialog, AddTask, BoardView, UsersSelect
    │   │   │   └── CommentTimestamp.jsx # 15s auto-refreshing relative timestamp component
    │   │   ├── pages/                  # Route views (Dashboard, Login, Tasks, TaskDetail, Users)
    │   │   ├── redux/                  # Redux Toolkit store and RTK Query slices
    │   │   │   ├── slices/             # authSlice, apiSlice
    │   │   │   └── slices/api/         # taskApiSlice, userApiSlice
    │   │   ├── utils/                  # Helper utilities (date formatting, classnames)
    │   │   ├── App.jsx                 # Top-level route tree and layout wrapper
    │   │   └── main.jsx                # React root mount point
    │   ├── package.json                # Frontend dependencies and build scripts
    │   └── vite.config.js              # Vite server and local proxy configuration
    │
    └── server/                         # Backend Application (Node.js + Express)
        ├── controllers/                # Request handlers (taskController, userController)
        ├── middleware/                 # authMiddleware (JWT), errorMiddleware
        ├── models/                     # Mongoose models (userModel, taskModel, notis)
        ├── routes/                     # Express routers (taskRoute, userRoute, index)
        ├── utils/                      # connectDB (connection caching), JWT generator
        ├── test_all_requirements.js    # Comprehensive 39-scenario automated test suite
        ├── package.json                # Backend dependencies and test scripts
        └── index.js                    # Server entrypoint and serverless handler export
```

---

## 12. Database Models and Relationships

```mermaid
erDiagram
    USER ||--o{ TASK : "assigned_to (team)"
    USER ||--o{ ACTIVITY : "author (by)"
    USER ||--o{ NOTICE : "recipient (team)"
    TASK ||--|{ ACTIVITY : "contains (activities)"
    TASK ||--|{ SUBTASK : "contains (subTasks)"
    TASK ||--o{ NOTICE : "triggers (task)"

    USER {
        ObjectId _id PK
        string name
        string title
        string role
        string email UK
        string password
        boolean isAdmin
        boolean isActive
        date createdAt
        date updatedAt
    }

    TASK {
        ObjectId _id PK
        string title
        string description
        string priority "high | medium | normal | low"
        string stage "todo | open | in progress | completed | closed"
        ObjectId[] team FK "ref: User"
        boolean isTrashed
        date date
        string[] assets
        string[] links
        date createdAt
        date updatedAt
    }

    ACTIVITY {
        string type "commented | assigned | started | in progress | bug | completed"
        string activity
        date date
        ObjectId by FK "ref: User"
    }

    SUBTASK {
        string title
        string tag
        boolean isCompleted
        date date
    }

    NOTICE {
        ObjectId _id PK
        string text
        string notiType "alert | message"
        ObjectId task FK "ref: Task"
        ObjectId[] team FK "ref: User"
        ObjectId[] isRead FK "ref: User"
        date createdAt
    }
```

---

## 13. Prerequisites and Installation Instructions

### 13.1 Prerequisites
- **Node.js:** v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm:** v9.0.0 or higher (packaged with Node.js)
- **MongoDB:** Active MongoDB Atlas Cluster or local MongoDB instance (v6.0+)
- **Git:** Version control CLI ([Download Git](https://git-scm.com/))

### 13.2 Clone the Repository
```bash
git clone https://github.com/vgnishmitha/worksync.git
cd worksync
```

### 13.3 Backend Setup
```bash
cd teamflow-main/server
npm install
```

Create `teamflow-main/server/.env` based on the template below:
```env
PORT=8800
NODE_ENV=development
JWT_SECRET=your_super_secret_64_character_hex_key_here
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.ncskfjl.mongodb.net/teamflow?retryWrites=true&w=majority
CLIENT_URL=http://localhost:3000
```

Start the backend development server:
```bash
npm run dev
# Server listening on port 8800
# Database Connected
```

### 13.4 Frontend Setup
Open a separate terminal window:
```bash
cd teamflow-main/client
npm install
```

Create `teamflow-main/client/.env`:
```env
VITE_APP_BASE_URL=http://localhost:8800
```

Start the Vite development server:
```bash
npm run dev
# Local: http://localhost:3000/
```

Access the application in your browser at `http://localhost:3000`.

---

## 14. Environment Variables

### 🔹 Backend Variables (`teamflow-main/server/.env`)
| Variable | Required | Default | Description | Safe Example |
|---|:---:|:---:|---|---|
| `PORT` | Optional | `5000` | Local HTTP port for the Express listener | `8800` |
| `NODE_ENV` | Required | `development` | Runtime environment mode | `development` or `production` |
| `JWT_SECRET` | Required | — | Cryptographic secret for signing JWT sessions | `a6c38f4d92e105b7...` |
| `MONGODB_URI` | Required | — | MongoDB Atlas SRV connection string | `mongodb+srv://user:pass@cluster0.net/db` |
| `CLIENT_URL` | Optional | `http://localhost:3000` | Allowed origin for CORS validation | `https://worksync.vercel.app` |

### 🔹 Frontend Variables (`teamflow-main/client/.env`)
| Variable | Required | Default | Description | Safe Example |
|---|:---:|:---:|---|---|
| `VITE_APP_BASE_URL` | Optional | `""` (relative `/api`) | Backend base URL. Omit in unified Vercel services | `http://localhost:8800` |

---

## 15. API Documentation

All protected endpoints require an `Authorization: Bearer <token>` header or a valid `token` cookie.

### 15.1 Authentication Endpoints (`/api/user`)

#### 1. User Registration
- **Method:** `POST /api/user/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Jane Developer",
  "email": "jane@example.com",
  "password": "password123",
  "title": "Software Engineer",
  "role": "Developer",
  "isAdmin": false
}
```
- **Response (201 Created):**
```json
{
  "_id": "6717a1b2c3d4e5f6a7b8c9d0",
  "name": "Jane Developer",
  "email": "jane@example.com",
  "isAdmin": false,
  "role": "Developer",
  "title": "Software Engineer",
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

#### 2. User Login
- **Method:** `POST /api/user/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```
- **Response (200 OK):**
```json
{
  "_id": "67179001a1b2c3d4e5f6a7b8",
  "name": "Admin",
  "email": "admin@gmail.com",
  "isAdmin": true,
  "role": "Admin",
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

---

### 15.2 Task & Issue Endpoints (`/api/task`)

#### 3. Create Issue
- **Method:** `POST /api/task/create`
- **Access:** Protected (Admin Only)
- **Request Body:**
```json
{
  "title": "Payment Webhook Timeout Under High Concurrency",
  "team": ["6717a1b2c3d4e5f6a7b8c9d0", "6717a1b2c3d4e5f6a7b8c9d1"],
  "stage": "todo",
  "priority": "high",
  "description": "Stripe webhook handling exceeds 3000ms threshold during checkout bursts."
}
```
- **Response (200 OK):**
```json
{
  "status": true,
  "task": {
    "_id": "6717b4c5d6e7f8a9b0c1d2e3",
    "title": "Payment Webhook Timeout Under High Concurrency",
    "team": ["6717a1b2c3d4e5f6a7b8c9d0", "6717a1b2c3d4e5f6a7b8c9d1"],
    "stage": "todo",
    "priority": "high",
    "isTrashed": false,
    "createdAt": "2026-10-22T10:00:00.000Z"
  },
  "message": "Task created successfully."
}
```

#### 4. Get Issue Details
- **Method:** `GET /api/task/:id`
- **Access:** Protected (Admin OR Assigned Team Member)
- **Response (200 OK):** Returns complete task object populated with assignees.
- **Response (403 Forbidden):** Returned if the authenticated regular user is not an assignee.
```json
{
  "status": false,
  "message": "Forbidden: You are not authorized to access this issue."
}
```

#### 5. Change Issue Stage
- **Method:** `PUT /api/task/change-stage/:id`
- **Access:** Protected (Admin OR Assigned Team Member)
- **Request Body:**
```json
{
  "stage": "in progress"
}
```
- **Response (200 OK):** Returns updated task with stage updated to `"in progress"`.

#### 6. Post Issue Activity / Comment
- **Method:** `POST /api/task/activity/:id`
- **Access:** Protected (Admin OR Assigned Team Member)
- **Request Body:**
```json
{
  "type": "commented",
  "activity": "Reproduced timeout locally with 50 concurrent requests. Profiling DB queries now."
}
```
- **Response (200 OK):**
```json
{
  "status": true,
  "message": "Activity posted successfully."
}
```

#### 7. Dashboard Statistics
- **Method:** `GET /api/task/dashboard`
- **Access:** Protected (All Authenticated Users)
- **Response (200 OK):**
```json
{
  "status": true,
  "totalTasks": 2,
  "tasks": {
    "todo": 1,
    "in progress": 1,
    "completed": 0
  },
  "graphData": [ ... ],
  "users": []
}
```
*(Note: `users` array contains user objects for Admin callers and is empty `[]` for regular users)*.

---

## 16. Manual Testing Checklist and Verified Results

All 16 test suites below have been verified against the live implementation and cross-referenced with the 39 automated integration tests in [test_all_requirements.js](file:///c:/Users/nishm/Downloads/teamflow-main/teamflow-main/server/test_all_requirements.js):

| Test ID | Test Category & Feature | Test Steps | Expected Result | Actual Result | Status |
|:---:|---|---|---|---|:---:|
| **TC-01** | **User Registration** | Send `POST /api/user/register` with valid user payload | User document created in MongoDB, salted password, JWT returned | HTTP 201 Created with valid auth token | **PASS** |
| **TC-02** | **Duplicate Email Prevention** | Attempt registration with an already registered email | API rejects request with duplicate email conflict | HTTP 400 "Email address already exists" | **PASS** |
| **TC-03** | **Admin Authentication** | Send `POST /api/user/login` with `admin@gmail.com` | User authenticated with `isAdmin: true` and session token | HTTP 200 with admin profile and token | **PASS** |
| **TC-04** | **Invalid Credentials** | Attempt login with incorrect password | System rejects authentication with generic invalid credentials message | HTTP 401 "Invalid email or password" | **PASS** |
| **TC-05** | **Deactivated User Guard** | Attempt login for user with `isActive: false` | Login blocked with deactivation notification | HTTP 401 "User account has been deactivated" | **PASS** |
| **TC-06** | **Admin Multi-Assignment** | Admin creates issue assigning User A and User B | Issue created with `team` array containing both ObjectIds | HTTP 200, task created with 2 assignees | **PASS** |
| **TC-07** | **Authorized Access** | User A and User B request `GET /api/task/:issue1_id` | Both users receive HTTP 200 with complete issue payload | HTTP 200 received by both User A and B | **PASS** |
| **TC-08** | **Strict Access Isolation** | Unassigned User C requests `GET /api/task/:issue1_id` | System refuses access with explicit forbidden response | HTTP 403 "Forbidden: Not authorized" | **PASS** |
| **TC-09** | **Issue Feed Filtering** | User A calls `GET /api/task` | Returned issue list contains only tickets assigned to User A | HTTP 200, feed strictly filtered to assignees | **PASS** |
| **TC-10** | **Assignee Revocation** | Admin updates issue removing User B from `team` | User B access revoked immediately on subsequent requests | HTTP 403 Forbidden on next User B request | **PASS** |
| **TC-11** | **Unauthorized Commenting** | Unassigned user calls `POST /api/task/activity/:id` | System blocks comment creation on unassigned issue | HTTP 403 Forbidden | **PASS** |
| **TC-12** | **Status Transition (Assigned)** | Assigned User A transitions issue to `in progress` | Stage updated in MongoDB and persisted across requests | HTTP 200, stage persists as "in progress" | **PASS** |
| **TC-13** | **Status Transition (Unauthorized)** | Unassigned user attempts stage update on Issue 2 | Status update rejected with permission failure | HTTP 403 Forbidden | **PASS** |
| **TC-14** | **Comment Creation & Timestamps** | Post comment and inspect activity creation date | Activity date accurately preserved in UTC timestamp | Date correctly saved; UI displays "Just now" | **PASS** |
| **TC-15** | **Dashboard Metric Isolation** | User A calls `GET /api/task/dashboard` | Metric counters reflect strictly User A's assigned issues | Counts match User A workload; users list empty | **PASS** |
| **TC-16** | **Admin Only Operations** | Regular user attempts `PUT /api/task/:id` (trash) | System rejects non-admin attempt to trash or delete | HTTP 403 "Administrator access required" | **PASS** |

---

## 17. Known Issues and Limitations

1. **MongoDB Atlas Whitelist Requirement:** In cloud deployments, Vercel functions execute on dynamic AWS IP addresses. If MongoDB Atlas Network Access is not configured to allow `0.0.0.0/0`, Mongoose queries buffer and time out with `MongooseError: Operation users.findOne() buffering timed out after 10000ms`.
2. **Cold Start Latency:** Serverless platforms occasionally spin down idle instances. The initial HTTP request after inactivity may take 2–3 seconds while the container initializes and connects to MongoDB Atlas.
3. **Blocked Status UI:** The `blocked` workflow state is currently tracked via High Priority tagging and activity comments, rather than a dedicated fourth status lane.

---

## 18. Deployment Architecture and Instructions

The repository is configured to support two production hosting paradigms:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT ARCHITECTURE OPTIONS                      │
├───────────────────────────────────┬────────────────────────────────────┤
│ OPTION 1: VERCEL MULTI-SERVICES   │ OPTION 2: RENDER + VERCEL SPLIT    │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Unified project on one domain   │ • Backend API on Render Web Service│
│ • Zero CORS cross-origin friction │ • Frontend SPA on Vercel Static    │
│ • Atomic preview deployments      │ • Classic separate microservices   │
│ • Configured via `vercel.json`    │ • Configured via `render.yaml`     │
└───────────────────────────────────┴────────────────────────────────────┘
```

### 18.1 Option 1: Vercel Multi-Services (Recommended)

1. **Push Code to GitHub:**
   ```bash
   git push origin main
   ```
2. **Import to Vercel:**
   - Log in to [Vercel](https://vercel.com).
   - Click **Add New Project** -> Select `worksync`.
   - **Root Directory:** Leave as `./` (or select `teamflow-main`). Both root and subfolder descriptors are included.
3. **Configure Environment Variables in Vercel:**
   - `MONGODB_URI`: `mongodb+srv://vgnishmitha_db_user:<password>@cluster0.ncskfjl.mongodb.net/teamflow?retryWrites=true&w=majority`
   - `JWT_SECRET`: `08816cfad38bd4966bdbb732db1413c8e305cae5f102568a8272f83a481c3be9`
   - `NODE_ENV`: `production`
4. **Configure MongoDB Atlas Network Access:**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com) -> **Network Access**.
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere).
5. **Deploy:** Click **Deploy**. Vercel compiles the Vite frontend and provisions Express serverless handlers automatically.

---

### 18.2 Option 2: Render (Backend) + Vercel (Frontend) Split

1. **Deploy Backend on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com) -> **New Web Service**.
   - Connect repository `https://github.com/vgnishmitha/worksync.git`.
   - Set **Root Directory** to `teamflow-main/server`.
   - Set **Build Command** to `npm install`.
   - Set **Start Command** to `npm start`.
   - Set environment variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`).
2. **Deploy Frontend on Vercel:**
   - Set **Root Directory** to `teamflow-main/client`.
   - Framework preset: `Vite`.
   - Add environment variable: `VITE_APP_BASE_URL=https://your-render-api.onrender.com`.

---

## 19. Live Deployment URL

| Target | Deployment Status | URL / Link |
|---|:---:|---|
| **GitHub Source Code** | **Active & Synced** | [https://github.com/vgnishmitha/worksync.git](https://github.com/vgnishmitha/worksync.git) |
| **Vercel Multi-Service Deployment** | **Configured & Deployed** | Available via your Vercel Project Dashboard *(ensure Atlas `0.0.0.0/0` is allowed)* |
| **Local Verified Instance** | **Active & Running** | [http://localhost:3000](http://localhost:3000) (API: `http://localhost:8800`) |

---

## 20. Future Enhancements

- 🔷 **Dedicated Blocked Status:** Introduce an explicit `blocked` status enum and visual lane with dependency blocker linking.
- 🔷 **Real-Time WebSockets:** Implement Socket.io for instantaneous ticket movement across active browser sessions without polling.
- 🔷 **OAuth Single Sign-On:** Google Workspace and GitHub Enterprise SSO integration.
- 🔷 **Automated SLA Tracking:** Due date escalation alerts and automatic email notifications via SendGrid.

---

## 21. Repository and Author Information

- **Project Name:** WorkSync / TeamFlow Issue Tracker System
- **Lead Developer & Author:** Nishmitha VG ([vgnishmitha](https://github.com/vgnishmitha))
- **Organization / License:** Codewave • ISC License
- **Git Repository:** [https://github.com/vgnishmitha/worksync.git](https://github.com/vgnishmitha/worksync.git)
- **Documentation Version:** 2.1.0 (Production Release)
