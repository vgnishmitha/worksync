import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protectRoute = asyncHandler(async (req, res, next) => {
  let token = null;

  if (
    req.headers?.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Not authorized: No authentication token provided.",
    });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.userId).select(
      "isAdmin email isActive"
    );

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Not authorized: User account not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        status: false,
        message: "Forbidden: User account has been deactivated.",
      });
    }

    req.user = {
      email: user.email,
      isAdmin: user.isAdmin,
      userId: decodedToken.userId,
    };
    next();
  } catch (error) {
    // If primary token failed and an alternate exists in cookie, try fallback
    if (req.cookies?.token && req.cookies.token !== token) {
      try {
        const decodedFallback = jwt.verify(
          req.cookies.token,
          process.env.JWT_SECRET
        );
        const fallbackUser = await User.findById(decodedFallback.userId).select(
          "isAdmin email isActive"
        );
        if (fallbackUser && fallbackUser.isActive) {
          req.user = {
            email: fallbackUser.email,
            isAdmin: fallbackUser.isAdmin,
            userId: decodedFallback.userId,
          };
          return next();
        }
      } catch (e) {
        // Fallback also failed
      }
    }

    return res.status(401).json({
      status: false,
      message: "Not authorized: Invalid or expired token.",
    });
  }
});

const isAdminRoute = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({
      status: false,
      message: "Forbidden: Administrator access required.",
    });
  }
};

export { isAdminRoute, protectRoute };
