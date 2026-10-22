import mongoose from "mongoose";
import User from "../models/userModel.js";

let cachedPromise = null;

const dbConnection = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not defined. Please add MONGODB_URI to your Vercel Project Settings -> Environment Variables."
    );
  }

  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      })
      .then(async (conn) => {
        console.log("Database Connected");

        try {
          const adminExist = await User.findOne({ email: "admin@gmail.com" });
          if (!adminExist) {
            const password = "admin123";
            await User.create({
              name: "Admin",
              title: "Admin",
              role: "Admin",
              email: "admin@gmail.com",
              password: password,
              isAdmin: true,
            });
            console.log("Admin user created");
          }
        } catch (adminErr) {
          console.error("Error creating default admin:", adminErr.message);
        }

        return conn;
      })
      .catch((err) => {
        cachedPromise = null;
        console.error("MongoDB Connection Error:", err.message);
        throw new Error(
          `Database connection failed: ${err.message}. Please verify MONGODB_URI and ensure MongoDB Atlas IP Access List allows 0.0.0.0/0 (anywhere).`
        );
      });
  }

  return cachedPromise;
};

export default dbConnection;
