import { Router } from "express";
import { TipoConta } from "../generated/prisma/client";
import {
  registerUser,
  loginUser,
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
} from "./service";
import {
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
} from "./errors";
import { authenticate } from "./middleware";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const { email, senha } = req.body ?? {};

  if (typeof email !== "string" || typeof senha !== "string") {
    return res.status(400).json({ error: "Email ou senha inválidos" });
  }

  try {
    const user = await registerUser(email, senha, TipoConta.ATENDENTE);
    return res.status(201).json(user);
  } catch (error) {
    if (error instanceof EmailAlreadyRegisteredError) {
      return res.status(409).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, senha } = req.body ?? {};
  if (typeof email !== "string" || typeof senha !== "string") {
    return res.status(400).json({ error: "Email ou senha inválidos" });
  }
  try {
    const user = await loginUser(email, senha);

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return res.status(401).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

authRouter.get("/me", authenticate, (req, res) => {
  return res.json(req.user);
});

authRouter.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body ?? {};
  if (typeof refreshToken !== "string") {
    return res.status(400).json({ error: "Token de atualização inválido" });
  }
  try {
    const accessToken = await refreshAccessToken(refreshToken);

    return res.status(200).json({ accessToken });
  } catch (error) {
    if (error instanceof InvalidRefreshTokenError) {
      return res.status(401).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});
