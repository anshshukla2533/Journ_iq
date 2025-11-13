// backend/middlewares/protectRoute.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('No valid auth header found');
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    const token = authHeader.split(" ")[1];
    console.log('Token extracted:', token ? 'Token present' : 'No token');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully');
    
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = user;
    console.log('User authenticated:', user._id);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: "Invalid Token" });
  }
};

export default protect;
