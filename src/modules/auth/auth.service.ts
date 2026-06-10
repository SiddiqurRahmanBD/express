import bcrypt from "bcryptjs";
import { pool } from "../../db";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";

const loginUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;
  // 1. Check if the user exists in database
  // 2. Compare the password
  // 3. Genarate Token

  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }
  const user = userData.rows[0];
  //   console.log(user);
  const matchpassword = await bcrypt.compare(password, user.password);
  console.log(matchpassword);
  if (!matchpassword) {
    throw new Error("Invalid Credentials!");
  }

  // Genarat Token

  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    is_acive: user.is_active,
    email: user.email,
  };
  const accessToken = jwt.sign(jwtPayload, config.secret as string, {
    expiresIn:"1d",
  });
  const refreshToken = jwt.sign(jwtPayload, config.refresh_secret as string, {
    expiresIn: "10d",
  });
  return { accessToken, refreshToken };
};
const genarateRefreshToken = async (token: string) => {
  if (!token) {
    throw new Error("Unauthorized access!");
  }

  const decoded = jwt.verify(
    token as string,
    config.refresh_secret as string,
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
    throw new Error("User not found!");
  }
  if (!user?.is_active) {
    throw new Error("Forbidden!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    is_acive: user.is_active,
    email: user.email,
  };
  const accessToken = jwt.sign(jwtPayload, config.secret as string, {
    expiresIn: "1d",
  });
  return { accessToken };
};
export const authService = {
  loginUserIntoDB,
  genarateRefreshToken,
};
