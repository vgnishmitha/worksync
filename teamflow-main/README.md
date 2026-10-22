
# TeamFlow (MERN Stack)

# Overview
TeamFlow is a web application designed to streamline team task management. Built using the MERN stack (MongoDB, Express.js, React, and Node.js), this platform provides a user-friendly interface for efficient task assignment, tracking, and collaboration. The application caters to administrators and regular users, offering comprehensive features to enhance productivity and organization.

### Why/Problem?
In a dynamic work environment, effective task management is crucial for team success. Traditional methods of task tracking through spreadsheets or manual systems can be cumbersome and prone to errors. TeamFlow aims to address these challenges by providing a centralized platform for task management, enabling seamless collaboration and improved workflow efficiency.

### **Background**:
With the rise of remote work and dispersed teams, there is a growing need for tools that facilitate effective communication and task coordination. TeamFlow addresses this need by leveraging modern web technologies to create an intuitive and responsive task management solution. The MERN stack ensures scalability, while the integration of Redux Toolkit, Headless UI, and Tailwind CSS enhances user experience and performance.

# Project Report: Full Stack Web Application Development

## Introduction
This report details the development of TeamFlow, a full-stack web application for task management. The project is built on the MERN stack (MongoDB, Express.js, React, and Node.js) and is designed to facilitate efficient teamwork and project collaboration. This document covers the project's objectives, features, architecture, and implementation details.

## Objectives
* To develop a robust and scalable web application for managing team tasks.
* To implement role-based access control, distinguishing between administrators and regular users.
* To provide a feature-rich environment for task creation, assignment, tracking, and collaboration.
* To create a user-friendly and intuitive interface that enhances the user experience.
* To build a secure and performant application suitable for a professional team environment.

## Core Features

### **Admin Features:**
1. **User Management:**
    - Create admin accounts.
    - Add and manage team members.

2. **Task Assignment:**
    - Assign tasks to individual or multiple users.
    - Update task details and status.

3. **Task Properties:**
    - Label tasks as todo, in progress, or completed.
    - Assign priority levels (high, medium, normal, low).
    - Add and manage sub-tasks.

4. **Asset Management:**
    - Upload task assets, such as images.

5. **User Account Control:**
    - Disable or activate user accounts.
    - Permanently delete or trash tasks.


### **User Features:**
1. **Task Interaction:**
    - Change task status (in progress or completed).
    - View detailed task information.

2. **Communication:**
    - Add comments to task activities.


### **General Features:**
1. **Authentication and Authorization:**
    - User login with secure authentication.
    - Role-based access control.

2. **Profile Management:**
    - Update user profiles.

3. **Password Management:**
    - Change passwords securely.

4. **Dashboard:**
    - Provide a summary of user activities.
    - Filter tasks into todo, in progress, or completed.

## System Requirements
* **Hardware:** A standard personal computer with a modern processor, at least 4GB of RAM, and a stable internet connection.
* **Software:**
    * A modern web browser such as Google Chrome, Mozilla Firefox, or Microsoft Edge.
    * Node.js and npm for running the application.
    * MongoDB for the database.

## Functional Requirements
* The system must allow users to register and log in.
* The system must provide role-based access control (admin, user).
* Administrators must be able to create, read, update, and delete users.
* Administrators must be able to create, assign, update, and delete tasks.
* Users must be able to view their assigned tasks and update their status.
* Users must be able to add comments to tasks.
* The system must provide a dashboard to visualize task statistics.

## Non-functional Requirements
* **Performance:** The application should have a fast load time and a responsive user interface.
* **Security:** All user data, especially passwords, must be securely stored. The application should be protected against common web vulnerabilities.
* **Usability:** The interface should be intuitive and easy to use for non-technical users.
* **Scalability:** The application should be able to handle a growing number of users and tasks without a significant degradation in performance.

## Technologies Used
- **Frontend:**
    - React (Vite)
    - Redux Toolkit for State Management
    - Headless UI
    - Tailwind CSS

- **Backend:**
    - Node.js with Express.js
    
- **Database:**
    - MongoDB for efficient and scalable data storage.

## System Architecture
```
+-----------------+      +-----------------+      +-----------------+
|   React (UI)    |----->| Express (API)   |----->|   MongoDB       |
| (Vite, Redux)   |      | (Node.js)       |      | (Database)      |
+-----------------+      +-----------------+      +-----------------+
      |                                      ^
      | (User Interaction)                   | (Data Persistence)
      v                                      |
+-----------------+      +-----------------+      +-----------------+
|   Browser       |      |   HTTP Requests |      |      Data       |
| (User)          |      |   (REST API)    |      | (Collections)   |
+-----------------+      +-----------------+      +-----------------+
```

## User Flow Diagram

[User Flow Diagram - Blank Space]

## Modules and Description
* **Authentication Module:** Handles user registration, login, logout, and password management. It is responsible for JWT-based authentication and authorization.
* **User Management Module:** Allows administrators to manage team members, including adding new users, updating user roles, and activating/deactivating accounts.
* **Task Management Module:** The core module of the application. It enables the creation, assignment, and tracking of tasks and sub-tasks. It also handles task-related activities like comments and asset uploads.
* **Dashboard Module:** Provides a high-level overview of the project's status, including task progress and team activity, through charts and statistics.
* **Notification Module:** Manages and displays notifications to users about task assignments, updates, and comments.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /user/register | Register a new user |
| POST | /user/login | Login a user |
| POST | /user/logout | Logout a user |
| GET | /user/get-team | Get team list |
| GET | /user/notifications | Get notifications list |
| GET | /user/get-status | Get user task status (admin only) |
| PUT | /user/profile | Update user profile |
| PUT | /user/read-noti | Mark notification as read |
| PUT | /user/change-password | Change user password |
| PUT | /user/:id | Activate/Deactivate user profile (admin only) |
| DELETE | /user/:id | Delete user profile (admin only) |
| POST | /task/create | Create a new task (admin only) |
| POST | /task/duplicate/:id | Duplicate a task (admin only) |
| POST | /task/activity/:id | Post a task activity |
| GET | /task/dashboard | Get dashboard statistics |
| GET | /task | Get all tasks |
| GET | /task/:id | Get a single task |
| PUT | /task/create-subtask/:id | Create a sub-task (admin only) |
| PUT | /task/update/:id | Update a task (admin only) |
| PUT | /task/change-stage/:id | Change task stage |
| PUT | /task/change-status/:taskId/:subTaskId | Change sub-task status |
| PUT | /task/:id | Trash a task |
| DELETE | /task/delete-restore/:id? | Delete/Restore a task (admin only) |

## Database Schema

### User Schema
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
}
```

### Task Schema
```javascript
{
  title: { type: String, required: true },
  date: { type: Date, default: new Date() },
  priority: {
    type: String,
    default: "normal",
    enum: ["high", "medium", "normal", "low"],
  },
  stage: {
    type: String,
    default: "todo",
    enum: ["todo", "in progress", "completed"],
  },
  activities: [
    {
      type: {
        type: String,
        default: "assigned",
        enum: [
          "assigned",
          "started",
          "in progress",
          "bug",
          "completed",
          "commented",
        ],
      },
      activity: String,
      date: { type: Date, default: new Date() },
      by: { type: Schema.Types.ObjectId, ref: "User" },
    },
  ],
  subTasks: [
    {
      title: String,
      date: Date,
      tag: String,
      isCompleted: Boolean,
    },
  ],
  description: String,
  assets: [String],
  links: [String],
  team: [{ type: Schema.Types.ObjectId, ref: "User" }],
  isTrashed: { type: Boolean, default: false },
}
```

### Notice Schema
```javascript
{
  team: [{ type: Schema.Types.ObjectId, ref: "User" }],
  text: { type: String },
  task: { type: Schema.Types.ObjectId, ref: "Task" },
  notiType: { type: String, default: "alert", enum: ["alert", "message"] },
  isRead: [{ type: Schema.Types.ObjectId, ref: "User" }],
}
```

## UI Screenshots

### Login Page
[Login Page Screenshot - Blank Space]

### Dashboard
[Dashboard Screenshot - Blank Space]

### Tasks Page
[Tasks Page Screenshot - Blank Space]

### User Management Page
[User Management Screenshot - Blank Space]


## Testing

### Test Case 1: Successful User Login
* **Objective:** To verify that a registered user can log in successfully with valid credentials.
* **Steps:**
    1. Navigate to the login page.
    2. Enter a valid email and password.
    3. Click the "Login" button.
* **Expected Result:** The user is redirected to their dashboard, and a success message is displayed.
* **Screenshot:**
[Login Test Success Screenshot - Blank Space]

### Test Case 2: Admin Task Creation
* **Objective:** To ensure that an administrator can successfully create a new task.
* **Steps:**
    1. Log in as an administrator.
    2. Go to the "Tasks" page.
    3. Click on the "Create Task" button.
    4. Fill in all the required task details (title, priority, team members, etc.).
    5. Click "Save".
* **Expected Result:** The new task is added to the task list and assigned to the selected team members.
* **Screenshot:**
[Admin Task Creation Screenshot - Blank Space]

## Future Enhancement
* **Real-time Collaboration:** Integrate WebSockets to enable real-time updates and notifications, allowing users to see changes without refreshing the page.
* **Third-Party Integrations:** Allow integration with other tools like Google Calendar, Slack, or Trello to streamline workflows.
* **Advanced Reporting:** Develop a more advanced reporting module with customizable reports and data visualization options.
* **Mobile Application:** Create a native or cross-platform mobile application for iOS and Android to provide on-the-go access.

## Conclusion
TeamFlow is a comprehensive task management application that successfully meets its objectives. By leveraging the MERN stack, it provides a scalable and efficient solution for team collaboration. The application's intuitive design and robust feature set make it a valuable tool for any team looking to improve its productivity and organization. With potential for future enhancements, TeamFlow is well-positioned to evolve and adapt to the ever-changing needs of modern workplaces.

## SETUP INSTRUCTIONS

# Server Setup

## Environment variables
First, create the environment variables file `.env` in the server folder. The `.env` file contains the following environment variables:

- MONGODB_URI = `your MongoDB URL`
- JWT_SECRET = `any secret key - must be secured`
- PORT = `8800` or any port number
- NODE_ENV = `development`

&nbsp;

## Set Up MongoDB:

### Option 1: Set Up MongoDB Atlas (Cloud)
1. Setting up MongoDB involves a few steps:
    - Visit MongoDB Atlas Website
        - Go to the MongoDB Atlas website: [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).

    - Create an Account
    - Log in to your MongoDB Atlas account.
    - Create a New Cluster
    - Choose a Cloud Provider and Region
    - Configure Cluster Settings
    - Create Cluster
    - Wait for Cluster to Deploy
    - Create Database User
    - Set Up IP Whitelist
    - Connect to Cluster
    - Configure Your Application
    - Test the Connection

2. Create a new database and configure the `.env` file with the MongoDB connection URL. 

### Option 2: Set Up MongoDB Locally
1.  **Download and Install MongoDB Community Server:**
    *   Go to the [MongoDB Community Server download page](https://www.mongodb.com/try/download/community) and download the version for your operating system.
    *   Follow the installation instructions for your OS.

2.  **Start the MongoDB Service:**
    *   **Windows:** If you installed MongoDB as a service, it should start automatically. You can also start it manually from the "Services" application.
    *   **macOS:** You can start MongoDB using Homebrew with the command: `brew services start mongodb-community`
    *   **Linux:** You can start the MongoDB service with the command: `sudo systemctl start mongod`

3.  **Verify MongoDB is running:**
    *   Open a terminal or command prompt and run the command `mongosh`. This should connect you to your local MongoDB instance.

4.  Create a new database and configure the `.env` file with the MongoDB connection URL (e.g., `mongodb://localhost:27017/task-manager`). The application will automatically create the database if it doesn't exist.

## Steps to run server

1. Open the project in any editor of choice.
2. Navigate into the server directory `cd server`.
3. Run `npm i` or `npm install` to install the packages.
4. Run `npm start` to start the server.

If configured correctly, you should see a message indicating that the server is running successfully and `Database Connected`.

&nbsp;

# Client Side Setup

## Environment variables
First, create the environment variables file `.env` in the client folder. The `.env` file contains the following environment variables:

- VITE_APP_BASE_URL = `http://localhost:8800` #Note: Change the port 8800 to your port number.

## Steps to run client

1. Navigate into the client directory `cd client`.
2. Run `npm i` or `npm install` to install the packages.
3. Run `npm start` to run the app on `http://localhost:3000`.
4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
