import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protectRoute = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;
  if (!token && req.headers?.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decodedToken.userId).select(
        "isAdmin email"
      );

      if (user) {
        req.user = {
          email: user.email,
          isAdmin: user.isAdmin,
          userId: decodedToken.userId,
        };
        next();
      } else {
        return res
          .status(401)
          .json({ status: false, message: "Not authorized: User not found." });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(401)
        .json({ status: false, message: "Not authorized: Token verification failed." });
    }
  } else {
    return res
      .status(401)
      .json({ status: false, message: "Not authorized: No token provided in cookies." });
  }
});

const isAdminRoute = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(401).json({
      status: false,
      message: "Not authorized as admin. Try login as admin.",
    });
  }
};

export { isAdminRoute, protectRoute };
