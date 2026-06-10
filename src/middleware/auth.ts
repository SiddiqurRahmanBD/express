import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { ROLES } from "../types";


const auth = (...roles: ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // console.log(roles);
    // console.log("This is protected Route");
    // console.log(req.headers.authorization);
    try {
      const token = req.headers.authorization;

      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access!",
        });
      }

      const decoded = jwt.verify(
        token as string,
        config.secret as string,
      ) as JwtPayload;
      // console.log(decoded);
      const userdata = await pool.query(
        `
      SELECT * FROM users WHERE email=$1
      `,
        [decoded.email],
      );
      // console.log(userdata);
      const user = userdata.rows[0];
      console.log(user);

      if (userdata.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User not found!",
        });
        if (!user?.is_active) {
          res.status(403).json({
            success: false,
            message: "Forbidden!",
          });
        }
      }
      // console.log("User Role:",user.role);
      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden! This role has no access.",
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
