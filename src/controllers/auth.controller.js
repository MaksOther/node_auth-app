import { User } from "../models/User.js";
import { emailService } from "../services/email.services.js";
import { v4 as uuidv4 } from "uuid";
import { jwtService } from "../services/jwt.sevrices.js";
import { catchError } from "../utils/catchError.js";
import { ApiError } from "../exeptions/api.error.js";
import bcrypt from "bcrypt";

const validateEmail = (value) => {
  if (!value) return "Email is required";
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
  if (!emailPattern.test(value)) return "Email is not valid";
};

const validatePassword = (value) => {
  if (!value) return "Password is required";
  if (value.length < 6) return "At least 6 characters";
};

const registration = catchError(async (req, res) => {
  const { name, email, password } = req.body;
  const activateToken = uuidv4();

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    name: !name ? "Name is required" : undefined,
  };

  if (errors.email || errors.password || errors.name) {
    throw ApiError.badRequest("Bad request", errors);
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw ApiError.badRequest("Email error", { email: "Email is already taken" });
  }

  const hashedPass = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPass,
    activateToken,
  });

  await emailService.sendActivationEmail(email, activateToken);

  res.send(newUser);
});

const activate = catchError(async (req, res) => {
  const { activateToken } = req.params;
  const user = await User.findOne({ where: { activateToken } });

  if (!user) {
    throw ApiError.notFound();
  }

  user.activateToken = null;
  await user.save();

  res.send(user);
});

const login = catchError(async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: !email ? "Email is required" : undefined,
    password: !password ? "Password is required" : undefined,
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest("Missing fields", errors);
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.badRequest("No such user");
  }

  if (user.activateToken) {
    throw ApiError.badRequest("Please activate your email first");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest("Wrong password");
  }

  const userData = { id: user.id, email: user.email, name: user.name };

  const accessToken = jwtService.signAccess(userData);
  const refreshToken = jwtService.signRefresh(userData);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({ user: userData, accessToken });
});

const refresh = catchError(async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const user = await User.findByPk(userData.id);
  if (!user) {
    throw ApiError.unauthorized();
  }

  const newUserData = { id: user.id, email: user.email, name: user.name };
  const newAccessToken = jwtService.signAccess(newUserData);
  const newRefreshToken = jwtService.signRefresh(newUserData);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({ user: newUserData, accessToken: newAccessToken });
});

const logout = catchError(async (req, res) => {
  res.clearCookie("refreshToken");
  res.sendStatus(204);
});

export const AuthController = {
  registration,
  activate,
  login,
  refresh,
  logout,
};
