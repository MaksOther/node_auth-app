import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { catchError } from "../utils/catchError.js";

export const authRouter = new express.Router();

authRouter.post("/registration", catchError(AuthController.registration));
authRouter.get("/activate/:activateToken", catchError(AuthController.activate));
authRouter.post("/login", catchError(AuthController.login));

