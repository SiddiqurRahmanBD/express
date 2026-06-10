import type { Request, Response } from "express";
import { authService } from "./auth.service";

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);

    const { refreshToken } = result;

    res.cookie("refreshToken", refreshToken, {
      secure: false, // in production True
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(201).json({
      success: true,
      massage: " User login successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};
const refreshToken = async (req: Request, res: Response) => {
  try {
    const result = await authService.genarateRefreshToken(req.cookies.refreshToken);

    res.status(201).json({
      success: true,
      message: "Access Token genarated!",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};
export const authController = {
  loginUser,
  refreshToken,
};
