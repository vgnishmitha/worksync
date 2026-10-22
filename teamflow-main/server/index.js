
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler, routeNotFound } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";
import dbConnection from "./utils/connectDB.js";

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://3000-firebase-teamflow-1763300492074.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root endpoint: confirms the backend is running
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TeamSync API is running successfully",
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TeamSync API is running successfully",
  });
});

// API routes (support both /api prefix and root mounting)
app.use("/api", routes);
app.use("/", routes);

// Error handling — these must remain last
app.use(routeNotFound);
app.use(errorHandler);

// Connect to MongoDB
dbConnection();

// Start a local server outside Vercel
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
