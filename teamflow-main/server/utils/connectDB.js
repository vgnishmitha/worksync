import mongoose from "mongoose";
import User from "../models/userModel.js";

const dbConnection = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Database Connected");

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
  } catch (error) {
    console.log("DB Error: " + error);
  }
};

export default dbConnection;
