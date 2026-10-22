import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, default: Date.now },
    priority: {
      type: String,
      default: "normal",
      enum: ["high", "medium", "normal", "low"],
    },
    stage: {
      type: String,
      default: "todo",
      enum: ["todo", "open", "in progress", "completed", "closed"],
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
            "closed",
            "commented",
          ],
        },
        activity: String,
        date: { type: Date, default: Date.now },
        by: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    subTasks: [
      {
        title: String,
        date: { type: Date, default: Date.now },
        tag: String,
        isCompleted: { type: Boolean, default: false },
      },
    ],
    description: String,
    assets: [String],
    links: [String],
    team: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    isTrashed: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
