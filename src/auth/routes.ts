import { Router } from "express";
import { TipoConta } from "../generated/prisma/client";
import { registerUser } from "./service";
import { EmailAlreadyRegisteredError } from "./errors";

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
