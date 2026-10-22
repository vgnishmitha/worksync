# TeamFlow / WorkSync - Issue Tracker System

An enterprise-grade Issue Tracker and Project Management System built on the modern MERN stack (MongoDB, Express.js, React, Node.js). Designed for cross-functional teams, TeamFlow provides strict issue-level access control, multiple user assignments per issue, dynamic real-time status transitions, and automatically updating relative comment timestamps.

---

## Table of Contents
1. [Project Overview & Objectives](#1-project-overview--objectives)
2. [User Roles and Permissions](#2-user-roles-and-permissions)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture & Folder Structure](#4-system-architecture--folder-structure)
5. [Installation Prerequisites](#5-installation-prerequisites)
6. [Local Setup Instructions](#6-local-setup-instructions)
7. [MongoDB Configuration](#7-mongodb-configuration)
8. [Environment Variables](#8-environment-variables)
9. [Startup Commands](#9-startup-commands)
10. [API Endpoints Reference](#10-api-endpoints-reference)
11. [Authentication & Authorization Details](#11-authentication--authorization-details)
12. [Multiple Assignees & Issue Visibility Rules](#12-multiple-assignees--issue-visibility-rules)
13. [Comment Timestamps & Status Transition Behavior](#13-comment-timestamps--status-transition-behavior)
14. [Automated Testing & Validation](#14-automated-testing--validation)
15. [Troubleshooting Guide](#15-troubleshooting-guide)
16. [Deployment & Production Setup](#16-deployment--production-setup)
17. [Live Deployment URL & Source Code](#17-live-deployment-url--source-code)

---

## 1. Project Overview & Objectives

In modern distributed software teams, standard task trackers often fail either by being overly complex or by lacking granular, issue-level security. TeamFlow was created to solve these exact pain points by providing:

- **Strict Issue-Level Isolation:** Regular users only see and interact with issues explicitly assigned to them.
- **Multiple Assignees per Issue:** Administrators can assign one issue to one or multiple team members independently.
- **Robust Backend Authorization:** Access restrictions are enforced at every API endpoint and database query, completely preventing unauthorized URL manipulation or query tampering.
- **Accurate Comment Timestamps:** Comments display relative timestamps starting from "Just now" and automatically update to "1 minute ago", "5 minutes ago", "40 minutes ago", "2 hours ago", "3 days ago" dynamically without page reload.
- **Dynamic Issue Lifecycle:** Full support for Open, In Progress, and Closed states with immediate dashboard metric updates.

---

## 2. User Roles and Permissions

### Administrator (`isAdmin: true`)
- **Issue Management:** Create, view, edit, reassign, duplicate, trash, restore, and delete any issue.
- **Assignee Allocation:** Assign one or multiple registered users to any issue using a multi-select dropdown, and add or remove assignees at any time.
- **Access Scope:** Access all issues across all users, projects, and stages.
- **Team Management:** Add new users, view team rosters, and activate or deactivate user accounts.
- **Full Activity History:** View all activities, comments, subtasks, and assets across the entire organization.
- **Global Dashboard:** View total organization issue metrics and status distributions (Open, In Progress, Closed).

### Assigned Team Member (`isAdmin: false`)
- **Strict Issue-Level Access:** Can view **only** the issues to which they are explicitly assigned in the `team` array.
- **Issue Collaboration:** View details, descriptions, assets, and activities of assigned issues.
- **Status Updates:** Update the status of their assigned issues between **Open**, **In Progress**, and **Closed**.
- **Comments & Activities:** Post comments, progress logs, and resolution details on their assigned issues.
- **Subtask Execution:** Mark subtasks completed or uncompleted on their assigned issues.
- **Restricted Access:** Cannot access issues assigned exclusively to other team members (API returns `403 Forbidden`).
- **Restricted Privileges:** Cannot reassign, duplicate, trash, or delete issues, nor manage team users.
- **Isolated Dashboard:** Dashboard metrics (Total, Open, In Progress, Closed) reflect **strictly** the user's accessible assigned issues.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **State Management:** Redux Toolkit & RTK Query (with automated cache tag invalidation)
- **UI Components:** Tailwind CSS, Headless UI (`@headlessui/react`), React Icons
- **Routing:** React Router v6
- **Notifications:** Sonner Toast Notifications
- **Charts:** Recharts

### Backend
- **Runtime:** Node.js (ES Module format)
- **Framework:** Express.js 4.x
- **Database Driver:** Mongoose 8.x
- **Security:** JSON Web Tokens (`jsonwebtoken`), bcryptjs password hashing, cookie-parser, CORS
- **Error Handling:** Express Async Handler with centralized error middleware

### Database
- **Provider:** MongoDB Atlas (Cloud) / Local MongoDB Community Server
- **Models:** User, Task/Issue, Notice/Notification

---

## 4. System Architecture & Folder Structure

```
teamflow-main/
├── render.yaml                   # Infrastructure-as-Code deployment descriptor
├── README.md                     # Comprehensive technical documentation
├── BRD.md                        # Business Requirements Document
├── client/                       # React frontend SPA
│   ├── .env                      # Client environment variables (VITE_APP_BASE_URL)
│   ├── index.html                # Single-page HTML entrypoint
│   ├── package.json              # Client dependencies and scripts
│   ├── vite.config.js            # Vite build and proxy configuration
│   ├── vercel.json               # SPA routing rewrite configuration
│   └── src/
│       ├── components/           # Reusable UI components (Navbar, Sidebar, Dialogs, etc.)
│       │   ├── tasks/            # AddTask, UsersSelect, TaskCard, TaskDialog, Table, etc.
│       ├── pages/                # Page views: Dashboard, Tasks, TaskDetail, Users, Login, Trash
│       ├── redux/                # Redux Toolkit store and RTK Query API slices
│       │   └── slices/api/       # authApiSlice, taskApiSlice, userApiSlice
│       └── utils/                # Date formatting, relative time calculation, styles
└── server/                       # Node.js Express backend API
    ├── .env                      # Server environment variables (PORT, JWT_SECRET, MONGODB_URI)
    ├── index.js                  # Express application entrypoint and middleware
    ├── package.json              # Server dependencies and npm test scripts
    ├── test_all_requirements.js  # Automated 39-scenario test suite
    ├── controllers/              # Business logic: taskController.js, userController.js
    ├── middleware/               # authMiddleware.js, errorMiddleware.js
    ├── models/                   # Mongoose schemas: taskModel.js, userModel.js, notis.js
    ├── routes/                   # Route definitions: taskRoute.js, userRoute.js
    └── utils/                    # MongoDB connection and JWT cookie generator
```

---

## 5. Installation Prerequisites

Before running the application, ensure the following software is installed:
- **Node.js:** v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm:** v9.0.0 or higher (comes bundled with Node.js)
- **MongoDB:** An active [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster connection string or local MongoDB instance (v6.0+).
- **Modern Browser:** Google Chrome, Firefox, Safari, or Microsoft Edge.

---

## 6. Local Setup Instructions

### 1. Clone or Open the Repository
```bash
git clone https://github.com/vgnishmitha/worksync.git
cd worksync/teamflow-main
```

### 2. Configure Backend Environment
Navigate to `server/`:
```bash
cd server
npm install
```
Create or verify `server/.env`:
```env
PORT=8800
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/teamflow?retryWrites=true&w=majority
CLIENT_URL=http://localhost:3000
```

### 3. Configure Frontend Environment
Navigate to `client/`:
```bash
cd ../client
npm install
```
Create or verify `client/.env`:
```env
VITE_APP_BASE_URL=http://localhost:8800
```

---

## 7. MongoDB Configuration

### Option A: MongoDB Atlas (Recommended)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Free Cluster (M0 Sandbox).
3. Under **Database Access**, create a database user with Read/Write privileges.
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
5. Click **Connect** -> **Connect your application** -> Copy the connection string.
6. Paste the connection string into `server/.env` under `MONGODB_URI`.

### Option B: Local MongoDB
1. Ensure the MongoDB service is active (`mongod` or `brew services start mongodb-community`).
2. Set `MONGODB_URI=mongodb://127.0.0.1:27017/teamflow` in `server/.env`.

---

## 8. Environment Variables

| Variable | Location | Required | Description | Example Value |
|---|---|---|---|---|
| `PORT` | `server/.env` | Yes | Port on which Express server listens | `8800` |
| `NODE_ENV` | `server/.env` | Yes | Environment mode (`development` or `production`) | `development` |
| `JWT_SECRET` | `server/.env` | Yes | Cryptographic secret for signing JWTs | `a_very_long_secure_random_key` |
| `MONGODB_URI` | `server/.env` | Yes | MongoDB Atlas or Local connection URI | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `CLIENT_URL` | `server/.env` | Optional | Allowed CORS origin for production frontend | `http://localhost:3000` |
| `VITE_APP_BASE_URL` | `client/.env` | Yes | Base HTTP URL of backend API | `http://localhost:8800` |

---

## 9. Startup Commands

### Start Backend Server
```bash
cd teamflow-main/server
npm run dev     # Starts development server with nodemon on port 8800
# or
npm start       # Starts production Node server on port 8800
```

### Start Frontend Client
```bash
cd teamflow-main/client
npm run dev     # Starts Vite development server on port 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Admin Credentials
When the database initializes for the first time, an administrator account is seeded:
- **Email:** `admin@gmail.com`
- **Password:** `admin123`

---

## 10. API Endpoints Reference

### Authentication & Users (`/api/user`)
| Method | Endpoint | Access | Request Body | Description |
|---|---|---|---|---|
| `POST` | `/api/user/register` | Public / Admin | `{ name, email, password, title, role }` | Register new user account |
| `POST` | `/api/user/login` | Public | `{ email, password }` | Login user, issues JWT cookie and token |
| `POST` | `/api/user/logout` | Authenticated | None | Clear authentication cookie |
| `GET` | `/api/user/get-team` | Authenticated | Query: `?search=` | List active registered team members |
| `GET` | `/api/user/get-status`| Admin Only | None | User workload & assigned task progress |
| `PUT` | `/api/user/profile` | Authenticated | `{ name, title, role }` | Update user profile |
| `PUT` | `/api/user/:id` | Admin Only | `{ isActive: boolean }` | Activate or deactivate user profile |
| `DELETE` | `/api/user/:id` | Admin Only | None | Permanently delete user |

### Issues / Tasks (`/api/task`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/task/create` | Admin Only | Create and assign issue to one or multiple users |
| `POST` | `/api/task/duplicate/:id` | Admin Only | Duplicate existing issue and its assignments |
| `GET` | `/api/task` | Authenticated | Get issues (Admin gets all; User gets **only assigned**) |
| `GET` | `/api/task/:id` | Admin / Assignee | Get issue details (Unauthorized returns **403 Forbidden**) |
| `PUT` | `/api/task/update/:id` | Admin Only | Edit issue, reassign, add/remove assignees |
| `PUT` | `/api/task/change-stage/:id` | Admin / Assignee | Update status between Open, In Progress, Closed |
| `POST` | `/api/task/activity/:id` | Admin / Assignee | Post activity comment or status transition |
| `PUT` | `/api/task/create-subtask/:id` | Admin Only | Add subtask to issue |
| `PUT` | `/api/task/change-status/:taskId/:subTaskId` | Admin / Assignee | Toggle subtask completed status |
| `PUT` | `/api/task/:id` | Admin Only | Move issue to trash |
| `DELETE` | `/api/task/delete-restore/:id?actionType=` | Admin Only | Delete permanently or restore from trash |
| `GET` | `/api/task/dashboard` | Authenticated | Get role-isolated dashboard statistics |

---

## 11. Authentication & Authorization Details

1. **Dual Token Delivery:** The backend supports both `Authorization: Bearer <token>` in HTTP request headers (used by RTK Query) and HTTP-only cookies (`token`).
2. **Server-Side Verification:** Token payload contains `userId`. Middleware queries the database to verify active status and administrator privileges (`req.user.isAdmin`).
3. **HTTP Status Codes:**
   - `401 Unauthorized`: Missing, expired, or invalid token.
   - `403 Forbidden`: Authenticated user lacks permission (non-admin attempting admin route, or regular user attempting to view an unassigned issue).
   - `404 Not Found`: Issue or resource does not exist.

---

## 12. Multiple Assignees & Issue Visibility Rules

### Data Model
Each issue stores assignees in the `team` field as an array of MongoDB ObjectIds referencing the `User` collection:
```javascript
team: [{ type: Schema.Types.ObjectId, ref: "User", index: true }]
```

### Server-Side Isolation Rules
1. **Query Filtering (`GET /api/task`):**
   ```javascript
   if (!req.user.isAdmin) {
     query.team = { $in: [req.user.userId] };
   }
   ```
2. **Detail Protection (`GET /api/task/:id`):**
   ```javascript
   if (!req.user.isAdmin) {
     const isAssignee = task.team.some(m => m.toString() === req.user.userId);
     if (!isAssignee) {
       return res.status(403).json({ status: false, message: "Forbidden: Not authorized." });
     }
   }
   ```
3. **Immediate Revocation:** When an admin removes an assignee in `PUT /api/task/update/:id`, the issue's `team` array is updated in the database immediately. The removed user's subsequent requests to that issue immediately fail with `403 Forbidden`.

---

## 13. Comment Timestamps & Status Transition Behavior

### Comment Timestamps
- Comment objects preserve their initial insertion timestamp in `activities.date` (`Date.now` UTC).
- The `CommentTimestamp` React component calculates relative elapsed time using `getRelativeTime`:
  - Elapsed `< 60s`: Displays **"Just now"**
  - Elapsed `< 60m`: Displays **"X minute(s) ago"**
  - Elapsed `< 24h`: Displays **"X hour(s) ago"**
  - Elapsed `< 30d`: Displays **"X day(s) ago"**
  - Elapsed `≥ 30d`: Displays **"X month(s) / year(s) ago"**
- A **15-second interval timer** in `CommentTimestamp` automatically refreshes the displayed relative string on the page without requiring a page reload.
- Original comment creation timestamps are immutable and never overwritten when new activities are added.

### Status Transitions
- Authorized users (Admin or assigned team members) can transition issues between:
  - **Open** (`todo`)
  - **In Progress** (`in progress`)
  - **Closed** (`completed`)
- Updating an issue status triggers RTK Query tag invalidation for `Task` and `Dashboard`, immediately updating the UI and dashboard metric counts without requiring a manual window reload.

---

## 14. Automated Testing & Validation

A comprehensive automated test suite covers all 12 scenarios required by the system specification.

To execute the test suite:
```bash
cd teamflow-main/server
npm test
```

### Verified Test Scenarios (39/39 Passing)
1. **Scenario 1:** Admin logs in and creates Issue 1 assigned to User A and User B.
2. **Scenario 2:** User A and User B can access Issue 1; User C receives `403 Forbidden`.
3. **Scenario 3:** Admin creates Issue 2 assigned to User A and User C.
4. **Scenario 4:** User A and User C can access Issue 2; User B receives `403 Forbidden`.
5. **Scenario 5:** Admin creates Issue 3 assigned to User B and User C. Admin views all; User A sees 1 & 2 only; User B sees 1 & 3 only; User C sees 2 & 3 only.
6. **Scenario 6:** Unauthorized users cannot post comments, update stages, reassign, or trash issues via API requests.
7. **Scenario 7:** Removing User B from Issue 1 immediately revokes User B's access (`403 Forbidden`).
8. **Scenario 8:** Assigned users can change stage to In Progress and Closed, and post comments.
9. **Scenario 9:** Status changes persist in database after refresh.
10. **Scenario 10:** Dashboard metrics for total, open, in progress, and closed issues reflect strictly authorized counts.
11. **Scenario 11:** Comment creation timestamps are accurate and never overwritten.
12. **Scenario 12:** User registration and login flow work seamlessly.

---

## 15. Troubleshooting Guide

### Common Issues & Resolutions

1. **`Not authorized: No authentication token provided`**
   - Ensure you are logged in. Check that your browser allows cookies or that your request includes `Authorization: Bearer <token>`.
2. **`Forbidden: You are not authorized to access this issue`**
   - You are logged in as a regular user and attempting to access an issue not assigned to your account. Log in as an administrator or ask your admin to assign you to the issue.
3. **`CORS Error: Not allowed by CORS`**
   - Verify that your frontend port is included in `allowedOrigins` in `server/index.js` or set `CLIENT_URL` in `server/.env`.
4. **MongoDB Connection Fails (`DB Error: ...`)**
   - Check that MongoDB Atlas Network Access whitelist contains your current IP address (or `0.0.0.0/0`), and that database username and password in `server/.env` are URL-encoded if special characters exist.

---

## 16. Deployment & Production Setup

### A. Deploy Backend to Render
1. Create a **Web Service** on [Render](https://render.com).
2. Connect repository `https://github.com/vgnishmitha/worksync.git`.
3. Configure settings:
   - **Root Directory:** `teamflow-main/server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add Environment Variables:
   - `PORT`: `8800`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Generate a secure random 64-character secret.
   - `MONGODB_URI`: Your production MongoDB Atlas connection string.
   - `CLIENT_URL`: Your production frontend URL (e.g. `https://worksync-client.vercel.app`).

### B. Deploy Frontend to Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Configure settings:
   - **Root Directory:** `teamflow-main/client`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   - `VITE_APP_BASE_URL`: Your deployed backend URL (e.g. `https://worksync-api.onrender.com`).
4. Click **Deploy**. Vercel will build and host the application with the included `vercel.json` SPA rewrite rules.

---

## 17. Live Deployment URL & Source Code

- **GitHub Repository:** [https://github.com/vgnishmitha/worksync.git](https://github.com/vgnishmitha/worksync.git)
- **Live Production URL:** *(Deploy according to Section 16 instructions to obtain your unique live URL upon service provisioning; configured to connect with MongoDB Atlas Cluster0)*
- **Local Verified URL:** [http://localhost:3000](http://localhost:3000) (Backend API: [http://localhost:8800](http://localhost:8800))
