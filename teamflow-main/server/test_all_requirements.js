import dotenv from "dotenv";
dotenv.config();

const API_BASE = "http://localhost:8800/api";

const results = [];
function recordTest(name, passed, details = "") {
  results.push({ name, passed, details });
  console.log(`${passed ? "✅ PASS" : "❌ FAIL"}: ${name} ${details ? "(" + details + ")" : ""}`);
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log("==================================================");
  console.log("🚀 STARTING COMPREHENSIVE ISSUE TRACKER SYSTEM TESTS");
  console.log("==================================================\n");

  // Step 1: Admin Login
  const adminLogin = await api("/user/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@gmail.com", password: "admin123" }),
  });
  recordTest("Admin Login", adminLogin.ok && adminLogin.data.isAdmin === true, `Admin ID: ${adminLogin.data._id}`);
  const adminToken = adminLogin.data.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // Step 2: Register User A, User B, User C
  const timestamp = Date.now();
  const userAData = {
    name: "User A",
    email: `usera_${timestamp}@gmail.com`,
    password: "password123",
    title: "Frontend Developer",
    role: "Developer",
  };
  const userBData = {
    name: "User B",
    email: `userb_${timestamp}@gmail.com`,
    password: "password123",
    title: "Backend Developer",
    role: "Developer",
  };
  const userCData = {
    name: "User C",
    email: `userc_${timestamp}@gmail.com`,
    password: "password123",
    title: "QA Engineer",
    role: "QA",
  };

  const regA = await api("/user/register", { method: "POST", body: JSON.stringify(userAData) });
  recordTest("Register User A", regA.status === 201 && !!regA.data.token, `ID: ${regA.data._id}`);
  const tokenA = regA.data.token;
  const idA = regA.data._id;
  const headersA = { Authorization: `Bearer ${tokenA}` };

  const regB = await api("/user/register", { method: "POST", body: JSON.stringify(userBData) });
  recordTest("Register User B", regB.status === 201 && !!regB.data.token, `ID: ${regB.data._id}`);
  const tokenB = regB.data.token;
  const idB = regB.data._id;
  const headersB = { Authorization: `Bearer ${tokenB}` };

  const regC = await api("/user/register", { method: "POST", body: JSON.stringify(userCData) });
  recordTest("Register User C", regC.status === 201 && !!regC.data.token, `ID: ${regC.data._id}`);
  const tokenC = regC.data.token;
  const idC = regC.data._id;
  const headersC = { Authorization: `Bearer ${tokenC}` };

  console.log("\n--- Requirement 2 & 3: Multiple Assignees & Strict Access Control ---");
  // 1. Admin creates Issue 1 and assigns it to User A and User B
  const issue1Res = await api("/task/create", {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      title: "Issue 1: Payment Gateway Integration",
      team: [idA, idB],
      stage: "open",
      priority: "high",
      description: "Integrate Stripe and PayPal for User A and B",
    }),
  });
  const issue1 = issue1Res.data.task;
  recordTest("Scenario 1: Admin creates Issue 1 assigned to A and B", issue1Res.ok && issue1.team.length === 2);

  // 2. A and B can access Issue 1; C cannot
  const get1_A = await api(`/task/${issue1._id}`, { headers: headersA });
  const get1_B = await api(`/task/${issue1._id}`, { headers: headersB });
  const get1_C = await api(`/task/${issue1._id}`, { headers: headersC });
  recordTest("Scenario 2a: User A can access Issue 1", get1_A.status === 200 && get1_A.data.task._id === issue1._id);
  recordTest("Scenario 2b: User B can access Issue 1", get1_B.status === 200 && get1_B.data.task._id === issue1._id);
  recordTest("Scenario 2c: User C CANNOT access Issue 1 (403 Forbidden)", get1_C.status === 403);

  // 3. Admin creates Issue 2 and assigns it to User A and User C
  const issue2Res = await api("/task/create", {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      title: "Issue 2: User Profile UI Redesign",
      team: [idA, idC],
      stage: "in progress",
      priority: "medium",
      description: "Redesign profile page for User A and C",
    }),
  });
  const issue2 = issue2Res.data.task;
  recordTest("Scenario 3: Admin creates Issue 2 assigned to A and C", issue2Res.ok && issue2.team.length === 2);

  // 4. A and C can access Issue 2; B cannot
  const get2_A = await api(`/task/${issue2._id}`, { headers: headersA });
  const get2_C = await api(`/task/${issue2._id}`, { headers: headersC });
  const get2_B = await api(`/task/${issue2._id}`, { headers: headersB });
  recordTest("Scenario 4a: User A can access Issue 2", get2_A.status === 200 && get2_A.data.task._id === issue2._id);
  recordTest("Scenario 4b: User C can access Issue 2", get2_C.status === 200 && get2_C.data.task._id === issue2._id);
  recordTest("Scenario 4c: User B CANNOT access Issue 2 (403 Forbidden)", get2_B.status === 403);

  // 5. Admin creates Issue 3 and assigns it to User B and User C
  const issue3Res = await api("/task/create", {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      title: "Issue 3: Database Query Optimization",
      team: [idB, idC],
      stage: "open",
      priority: "normal",
      description: "Add compound indexes for User B and C",
    }),
  });
  const issue3 = issue3Res.data.task;
  recordTest("Scenario 5a: Admin creates Issue 3 assigned to B and C", issue3Res.ok);

  // Check Issue 3 access
  const get3_Admin = await api(`/task/${issue3._id}`, { headers: adminHeaders });
  const get3_B = await api(`/task/${issue3._id}`, { headers: headersB });
  const get3_C = await api(`/task/${issue3._id}`, { headers: headersC });
  const get3_A = await api(`/task/${issue3._id}`, { headers: headersA });
  recordTest("Scenario 5b: Admin can access Issue 3", get3_Admin.status === 200);
  recordTest("Scenario 5c: User B can access Issue 3", get3_B.status === 200);
  recordTest("Scenario 5d: User C can access Issue 3", get3_C.status === 200);
  recordTest("Scenario 5e: User A CANNOT access Issue 3 (403 Forbidden)", get3_A.status === 403);

  // Verify list filtering isolation
  const listA = await api("/task", { headers: headersA });
  const listB = await api("/task", { headers: headersB });
  const listC = await api("/task", { headers: headersC });
  const listAdmin = await api("/task", { headers: adminHeaders });

  const aTaskIds = listA.data.tasks.map((t) => t._id);
  const bTaskIds = listB.data.tasks.map((t) => t._id);
  const cTaskIds = listC.data.tasks.map((t) => t._id);

  recordTest("List Isolation User A has Issues 1 & 2 only", aTaskIds.includes(issue1._id) && aTaskIds.includes(issue2._id) && !aTaskIds.includes(issue3._id));
  recordTest("List Isolation User B has Issues 1 & 3 only", bTaskIds.includes(issue1._id) && !bTaskIds.includes(issue2._id) && bTaskIds.includes(issue3._id));
  recordTest("List Isolation User C has Issues 2 & 3 only", !cTaskIds.includes(issue1._id) && cTaskIds.includes(issue2._id) && cTaskIds.includes(issue3._id));
  recordTest("List Admin sees all Issues 1, 2, 3", [issue1._id, issue2._id, issue3._id].every((id) => listAdmin.data.tasks.some((t) => t._id === id)));

  console.log("\n--- Requirement 3: Unauthorized Action Prevention ---");
  // User C tries to post comment on Issue 1
  const postCommentC = await api(`/task/activity/${issue1._id}`, {
    method: "POST",
    headers: headersC,
    body: JSON.stringify({ type: "commented", activity: "Unauthorized comment attempt" }),
  });
  recordTest("Scenario 6a: Unauthorized user cannot post comment (403)", postCommentC.status === 403);

  // User B tries to change stage of Issue 2
  const changeStageB = await api(`/task/change-stage/${issue2._id}`, {
    method: "PUT",
    headers: headersB,
    body: JSON.stringify({ stage: "completed" }),
  });
  recordTest("Scenario 6b: Unauthorized user cannot change stage (403)", changeStageB.status === 403);

  // User A tries to edit / reassign Issue 1 (Admin only)
  const reassignA = await api(`/task/update/${issue1._id}`, {
    method: "PUT",
    headers: headersA,
    body: JSON.stringify({ title: "Hacked Title", team: [idA] }),
  });
  recordTest("Scenario 6c: Regular user cannot reassign issue (403)", reassignA.status === 403);

  // User A tries to trash Issue 1 (Admin only)
  const trashA = await api(`/task/${issue1._id}`, {
    method: "PUT",
    headers: headersA,
  });
  recordTest("Scenario 6d: Regular user cannot trash issue (403)", trashA.status === 403);

  console.log("\n--- Requirement 2: Assignee Removal Revokes Access Immediately ---");
  // Admin removes User B from Issue 1
  const updateRes = await api(`/task/update/${issue1._id}`, {
    method: "PUT",
    headers: adminHeaders,
    body: JSON.stringify({
      title: issue1.title,
      team: [idA], // only User A remains
      stage: issue1.stage,
      priority: issue1.priority,
    }),
  });
  recordTest("Scenario 7a: Admin removes User B from Issue 1", updateRes.ok);

  // User B tries to access Issue 1 now
  const get1_B_after = await api(`/task/${issue1._id}`, { headers: headersB });
  recordTest("Scenario 7b: Access immediately revoked for removed assignee B (403)", get1_B_after.status === 403);

  console.log("\n--- Requirement 4 & 5: Status Updates & Comment Timestamps ---");
  // Assigned User A updates status of Issue 1 to "in progress"
  const stageUpdate1 = await api(`/task/change-stage/${issue1._id}`, {
    method: "PUT",
    headers: headersA,
    body: JSON.stringify({ stage: "in progress" }),
  });
  recordTest("Scenario 8a: Assigned User A updates stage to In Progress", stageUpdate1.ok && stageUpdate1.data.task.stage === "in progress");

  // Assigned User A posts a comment
  const commentRes = await api(`/task/activity/${issue1._id}`, {
    method: "POST",
    headers: headersA,
    body: JSON.stringify({
      type: "commented",
      activity: "Investigating the Stripe webhook failure.",
    }),
  });
  recordTest("Scenario 8b: Assigned user adds comment", commentRes.ok);

  // Assigned User A marks issue as Closed
  const stageUpdate2 = await api(`/task/change-stage/${issue1._id}`, {
    method: "PUT",
    headers: headersA,
    body: JSON.stringify({ stage: "closed" }),
  });
  recordTest("Scenario 8c: Assigned user marks issue Closed (stage: completed)", stageUpdate2.ok && stageUpdate2.data.task.stage === "completed");

  // Scenario 9: Status change persists after refresh (re-fetching from DB)
  const get1_Persist = await api(`/task/${issue1._id}`, { headers: headersA });
  const taskPersisted = get1_Persist.data.task;
  recordTest("Scenario 9: Status change persists in database", taskPersisted.stage === "completed");

  // Scenario 11: Comment timestamp accurately stored
  const latestActivity = taskPersisted.activities[taskPersisted.activities.length - 1];
  const activityDate = new Date(latestActivity.date);
  const isRecentDate = Math.abs(Date.now() - activityDate.getTime()) < 30000;
  recordTest("Scenario 11: Activity stores original creation timestamp in DB", isRecentDate, `Timestamp: ${latestActivity.date}`);

  console.log("\n--- Requirement 6: Dashboard Statistics & Visibility ---");
  const dashAdmin = await api("/task/dashboard", { headers: adminHeaders });
  const dashA = await api("/task/dashboard", { headers: headersA });
  const dashB = await api("/task/dashboard", { headers: headersB });
  const dashC = await api("/task/dashboard", { headers: headersC });

  recordTest("Scenario 10a: Admin dashboard returns all tasks count", dashAdmin.ok && dashAdmin.data.totalTasks >= 3);
  recordTest("Scenario 10b: Admin dashboard includes users list", dashAdmin.data.users.length > 0);
  recordTest("Scenario 10c: Regular user dashboard never exposes users list", dashA.data.users.length === 0);
  recordTest("Scenario 10d: User A dashboard counts match authorized issues only", dashA.data.totalTasks === 2);
  recordTest("Scenario 10e: User A dashboard shows 1 Closed issue (Issue 1)", dashA.data.tasks.closed === 1 || dashA.data.tasks.completed === 1);
  recordTest("Scenario 10f: User B dashboard has only 1 issue (Issue 3)", dashB.data.totalTasks === 1);
  recordTest("Scenario 10g: User C dashboard has 2 issues (Issue 2 & 3)", dashC.data.totalTasks === 2);

  console.log("\n==================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`TEST SUMMARY: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
