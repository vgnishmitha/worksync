import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Notice from "../models/notis.js";
import Task from "../models/taskModel.js";
import User from "../models/userModel.js";

// Helper to normalize stage name
const normalizeStage = (stage) => {
  const s = (stage || "").toLowerCase().trim();
  if (s === "open" || s === "todo") return "todo";
  if (s === "closed" || s === "completed") return "completed";
  if (s === "in progress") return "in progress";
  return "todo";
};

// Helper for stage display label
const getStageDisplay = (stage) => {
  const s = normalizeStage(stage);
  if (s === "completed") return "Closed";
  if (s === "in progress") return "In Progress";
  return "Open";
};

// Helper to sanitize, validate, and deduplicate team member user IDs
const validateAndSanitizeTeam = async (team) => {
  let list = [];
  if (Array.isArray(team)) {
    list = team;
  } else if (team) {
    list = [team];
  }

  const rawIds = list
    .map((item) => (item?._id ? item._id.toString() : item?.toString()))
    .filter(Boolean);

  // Deduplicate IDs
  const uniqueIds = Array.from(new Set(rawIds));

  // Validate format as valid ObjectId
  const validObjectIds = uniqueIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );

  if (validObjectIds.length !== uniqueIds.length) {
    throw new Error("One or more assigned user IDs are not valid MongoDB ObjectIDs.");
  }

  // Validate that all IDs exist in User collection
  if (validObjectIds.length > 0) {
    const existingUsers = await User.find({
      _id: { $in: validObjectIds },
    }).select("_id");

    if (existingUsers.length !== validObjectIds.length) {
      throw new Error(
        "One or more assigned users do not exist as registered users."
      );
    }
  }

  return validObjectIds;
};

// CREATE TASK - Admin only
const createTask = asyncHandler(async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    if (!isAdmin) {
      return res.status(403).json({
        status: false,
        message: "Forbidden: Only administrators can create and assign issues.",
      });
    }

    const { title, team, stage, date, priority, assets, links, description } =
      req.body;

    let sanitizedTeam = [];
    try {
      sanitizedTeam = await validateAndSanitizeTeam(team);
    } catch (valErr) {
      return res.status(400).json({ status: false, message: valErr.message });
    }

    const normalizedStage = normalizeStage(stage);

    let text = "New task has been assigned to you";
    if (sanitizedTeam.length > 1) {
      text = text + ` and ${sanitizedTeam.length - 1} others.`;
    }

    const issuePriority = (priority || "normal").toLowerCase();
    text =
      text +
      ` The task priority is set to ${issuePriority} priority, so check and act accordingly. The task date is ${new Date(
        date || Date.now()
      ).toDateString()}. Thank you!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
      date: new Date(),
    };

    let newLinks = [];
    if (Array.isArray(links)) {
      newLinks = links;
    } else if (typeof links === "string" && links.trim().length > 0) {
      newLinks = links.split(",").map((l) => l.trim()).filter(Boolean);
    }

    const task = await Task.create({
      title,
      team: sanitizedTeam,
      stage: normalizedStage,
      date: date || new Date(),
      priority: issuePriority,
      assets: assets || [],
      activities: [activity],
      links: newLinks,
      description: description || "",
    });

    if (sanitizedTeam.length > 0) {
      await Notice.create({
        team: sanitizedTeam,
        text,
        task: task._id,
      });

      // Maintain user.tasks relationship
      await User.updateMany(
        { _id: { $in: sanitizedTeam } },
        { $addToSet: { tasks: task._id } }
      );
    }

    res.status(200).json({
      status: true,
      task,
      message: "Task created and assigned successfully.",
    });
  } catch (error) {
    console.error("CreateTask Error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

// DUPLICATE TASK - Admin only
const duplicateTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, isAdmin } = req.user;

    if (!isAdmin) {
      return res.status(403).json({
        status: false,
        message: "Forbidden: Only administrators can duplicate issues.",
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found." });
    }

    let text = "Duplicated task has been assigned to you";
    if (task.team?.length > 1) {
      text = text + ` and ${task.team.length - 1} others.`;
    }

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
      date: new Date(),
    };

    const newTask = await Task.create({
      title: "Duplicate - " + task.title,
      team: task.team,
      subTasks: task.subTasks || [],
      assets: task.assets || [],
      links: task.links || [],
      priority: task.priority,
      stage: task.stage,
      activities: [activity],
      description: task.description,
      date: new Date(),
    });

    if (task.team?.length > 0) {
      await Notice.create({
        team: task.team,
        text,
        task: newTask._id,
      });

      await User.updateMany(
        { _id: { $in: task.team } },
        { $addToSet: { tasks: newTask._id } }
      );
    }

    res.status(200).json({
      status: true,
      task: newTask,
      message: "Task duplicated successfully.",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
});

// UPDATE TASK / REASSIGN - Admin only
const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, isAdmin } = req.user;

  if (!isAdmin) {
    return res.status(403).json({
      status: false,
      message: "Forbidden: Only administrators can edit or reassign issues.",
    });
  }

  const { title, date, team, stage, priority, assets, links, description } =
    req.body;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found." });
    }

    let sanitizedTeam = [];
    if (team !== undefined) {
      try {
        sanitizedTeam = await validateAndSanitizeTeam(team);
      } catch (valErr) {
        return res.status(400).json({ status: false, message: valErr.message });
      }
    } else {
      sanitizedTeam = task.team;
    }

    let newLinks = [];
    if (Array.isArray(links)) {
      newLinks = links;
    } else if (typeof links === "string") {
      newLinks = links.split(",").map((l) => l.trim()).filter(Boolean);
    } else if (links === undefined) {
      newLinks = task.links;
    }

    // Determine removed and added assignees
    const oldAssignees = (task.team || []).map((m) => m.toString());
    const newAssignees = sanitizedTeam.map((m) => m.toString());

    const removedAssignees = oldAssignees.filter(
      (m) => !newAssignees.includes(m)
    );
    const addedAssignees = newAssignees.filter(
      (m) => !oldAssignees.includes(m)
    );

    task.title = title || task.title;
    task.date = date || task.date;
    if (priority) task.priority = priority.toLowerCase();
    if (assets !== undefined) task.assets = assets;
    if (stage) task.stage = normalizeStage(stage);
    task.team = sanitizedTeam;
    task.links = newLinks;
    if (description !== undefined) task.description = description;

    // Log reassignment activity if team changed
    if (removedAssignees.length > 0 || addedAssignees.length > 0) {
      task.activities.push({
        type: "assigned",
        activity: `Assignees updated by Administrator.`,
        by: userId,
        date: new Date(),
      });
    }

    await task.save();

    // Revoke access immediately for removed users and grant for added users in User.tasks
    if (removedAssignees.length > 0) {
      await User.updateMany(
        { _id: { $in: removedAssignees } },
        { $pull: { tasks: task._id } }
      );
    }
    if (addedAssignees.length > 0) {
      await User.updateMany(
        { _id: { $in: addedAssignees } },
        { $addToSet: { tasks: task._id } }
      );
    }

    res.status(200).json({
      status: true,
      task,
      message: "Task updated successfully.",
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

// UPDATE TASK STAGE - Admin or Assigned User
const updateTaskStage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const { userId, isAdmin } = req.user;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task/Issue not found." });
    }

    const isAssignee = task.team?.some(
      (memberId) => memberId.toString() === userId.toString()
    );

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({
        status: false,
        message: "Forbidden: You are not authorized to update status for this issue.",
      });
    }

    const normalizedStage = normalizeStage(stage);
    task.stage = normalizedStage;

    const displayLabel = getStageDisplay(normalizedStage);

    task.activities.push({
      type:
        normalizedStage === "completed"
          ? "completed"
          : normalizedStage === "in progress"
          ? "in progress"
          : "started",
      activity: `Status changed to ${displayLabel}`,
      by: userId,
      date: new Date(),
    });

    await task.save();

    res.status(200).json({
      status: true,
      task,
      message: `Issue status changed to ${displayLabel} successfully.`,
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

// UPDATE SUBTASK STAGE - Admin or Assigned User
const updateSubTaskStage = asyncHandler(async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const { status } = req.body;
    const { userId, isAdmin } = req.user;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task/Issue not found." });
    }

    const isAssignee = task.team?.some(
      (memberId) => memberId.toString() === userId.toString()
    );

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({
        status: false,
        message: "Forbidden: Not authorized to update subtasks for this issue.",
      });
    }

    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: taskId,
        "subTasks._id": subTaskId,
      },
      {
        $set: {
          "subTasks.$.isCompleted": Boolean(status),
        },
      },
      { new: true }
    );

    res.status(200).json({
      status: true,
      task: updatedTask,
      message: status
        ? "Subtask has been marked completed."
        : "Subtask has been marked undone.",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ status: false, message: error.message });
  }
});

// CREATE SUBTASK - Admin only
const createSubTask = asyncHandler(async (req, res) => {
  const { title, tag, date } = req.body;
  const { id } = req.params;
  const { isAdmin } = req.user;

  if (!isAdmin) {
    return res.status(403).json({
      status: false,
      message: "Forbidden: Only administrators can add subtasks.",
    });
  }

  try {
    const newSubTask = {
      title,
      date: date || new Date(),
      tag,
      isCompleted: false,
    };

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found." });
    }

    task.subTasks.push(newSubTask);
    await task.save();

    res.status(200).json({
      status: true,
      task,
      message: "SubTask added successfully.",
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

// GET TASKS - Strict issue-level access control
const getTasks = asyncHandler(async (req, res) => {
  try {
    const { stage, isTrashed, search } = req.query;
    const { userId, isAdmin } = req.user;

    let query = {};

    if (isTrashed === "true") {
      query.isTrashed = true;
    } else {
      query.isTrashed = false;
    }

    // Strict access control: regular users can only see issues explicitly assigned to them
    if (!isAdmin) {
      query.team = { $in: [userId] };
    }

    if (stage) {
      const s = stage.toLowerCase().trim();
      if (s === "todo" || s === "open") {
        query.stage = { $in: ["todo", "open"] };
      } else if (s === "completed" || s === "closed") {
        query.stage = { $in: ["completed", "closed"] };
      } else if (s === "in progress") {
        query.stage = "in progress";
      } else {
        query.stage = s;
      }
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const tasks = await Task.find(query)
      .populate({
        path: "team",
        select: "name title email role isActive",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      status: true,
      tasks,
    });
  } catch (error) {
    console.error("getTasks Error:", error);
    return res.status(400).json({ status: false, message: error.message });
  }
});

// GET SINGLE TASK - Strict issue-level access control
const getTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, isAdmin } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ status: false, message: "Invalid issue ID." });
    }

    const task = await Task.findById(id)
      .populate({
        path: "team",
        select: "name title role email isActive",
      })
      .populate({
        path: "activities.by",
        select: "name email role",
      });

    if (!task) {
      return res.status(404).json({ status: false, message: "Task/Issue not found." });
    }

    // Strict access control: Regular user can ONLY access if present in assignee list
    if (!isAdmin) {
      const isAssignee = task.team?.some(
        (member) => (member._id || member).toString() === userId.toString()
      );

      if (!isAssignee) {
        return res.status(403).json({
          status: false,
          message: "Forbidden: You are not authorized to access this issue.",
        });
      }
    }

    res.status(200).json({
      status: true,
      task,
    });
  } catch (error) {
    console.error("getTask Error:", error);
    return res.status(400).json({ status: false, message: error.message });
  }
});

// POST TASK ACTIVITY / COMMENTS - Admin or Assigned User
const postTaskActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, isAdmin } = req.user;
  const { type, activity } = req.body;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task/Issue not found." });
    }

    const isAssignee = task.team?.some(
      (memberId) => memberId.toString() === userId.toString()
    );

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({
        status: false,
        message: "Forbidden: Only assigned members or administrators can post comments or activities.",
      });
    }

    const rawType = (type || "commented").toLowerCase();
    const activityType =
      rawType === "closed" ? "completed" : rawType === "open" ? "started" : rawType;

    const data = {
      type: activityType,
      activity,
      by: userId,
      date: new Date(),
    };
    task.activities.push(data);

    // If an assigned user submits a completion activity, update issue stage to completed
    if (activityType === "completed") {
      task.stage = "completed";
    } else if (activityType === "in progress") {
      task.stage = "in progress";
    } else if (activityType === "started") {
      task.stage = "todo";
    }

    await task.save();

    res.status(200).json({
      status: true,
      task,
      message: "Activity posted successfully.",
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

// TRASH TASK - Admin only
const trashTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isAdmin } = req.user;

  if (!isAdmin) {
    return res.status(403).json({
      status: false,
      message: "Forbidden: Only administrators can trash issues.",
    });
  }

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found." });
    }

    task.isTrashed = true;
    await task.save();

    res.status(200).json({
      status: true,
      message: "Task moved to trash successfully.",
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

// DELETE / RESTORE TASK - Admin only
const deleteRestoreTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;
    const { isAdmin } = req.user;

    if (!isAdmin) {
      return res.status(403).json({
        status: false,
        message: "Forbidden: Only administrators can delete or restore issues.",
      });
    }

    if (actionType === "delete") {
      await Task.findByIdAndDelete(id);
      await User.updateMany({}, { $pull: { tasks: id } });
    } else if (actionType === "deleteAll") {
      const trashed = await Task.find({ isTrashed: true }).select("_id");
      const trashedIds = trashed.map((t) => t._id);
      await Task.deleteMany({ isTrashed: true });
      await User.updateMany({}, { $pull: { tasks: { $in: trashedIds } } });
    } else if (actionType === "restore") {
      const resp = await Task.findById(id);
      if (resp) {
        resp.isTrashed = false;
        await resp.save();
      }
    } else if (actionType === "restoreAll") {
      await Task.updateMany(
        { isTrashed: true },
        { $set: { isTrashed: false } }
      );
    }

    res.status(200).json({
      status: true,
      message: "Operation performed successfully.",
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

// DASHBOARD STATISTICS - Role-based isolation
const dashboardStatistics = asyncHandler(async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;

    // Admin sees all non-trashed tasks. Regular user sees ONLY their assigned non-trashed tasks.
    const allTasks = isAdmin
      ? await Task.find({ isTrashed: false })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .sort({ _id: -1 })
      : await Task.find({
          isTrashed: false,
          team: { $in: [userId] },
        })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .sort({ _id: -1 });

    const users = isAdmin
      ? await User.find({ isActive: true })
          .select("name title role isActive createdAt")
          .limit(10)
          .sort({ _id: -1 })
      : [];

    // Group tasks by stage strictly using authorized tasks
    const groupedTasks = {
      todo: 0,
      open: 0,
      "in progress": 0,
      completed: 0,
      closed: 0,
    };

    allTasks.forEach((task) => {
      const s = (task.stage || "").toLowerCase().trim();
      if (s === "todo" || s === "open") {
        groupedTasks.todo += 1;
        groupedTasks.open += 1;
      } else if (s === "completed" || s === "closed") {
        groupedTasks.completed += 1;
        groupedTasks.closed += 1;
      } else if (s === "in progress") {
        groupedTasks["in progress"] += 1;
      } else {
        groupedTasks.todo += 1;
        groupedTasks.open += 1;
      }
    });

    const graphData = Object.entries(
      allTasks.reduce((result, task) => {
        const priority = task.priority || "normal";
        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    const totalTasks = allTasks.length;
    const last10Task = allTasks.slice(0, 10);

    const summary = {
      totalTasks,
      last10Task,
      users,
      tasks: groupedTasks,
      graphData,
    };

    res.status(200).json({
      status: true,
      ...summary,
      message: "Dashboard statistics retrieved successfully.",
    });
  } catch (error) {
    console.error("DashboardStatistics Error:", error);
    return res.status(400).json({ status: false, message: error.message });
  }
});

export {
  createSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  duplicateTask,
  getTask,
  getTasks,
  postTaskActivity,
  trashTask,
  updateSubTaskStage,
  updateTask,
  updateTaskStage,
};
