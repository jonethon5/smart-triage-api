import { Router } from "express";
import { openTicket } from "./service";

export const ticketsRouter = Router();

ticketsRouter.post("/", async (req, res) => {
  const { nomeSolicitante, emailSolicitante, titulo, descricao } =
    req.body ?? {};

  if (
    typeof nomeSolicitante !== "string" ||
    typeof emailSolicitante !== "string" ||
    typeof titulo !== "string" ||
    typeof descricao !== "string"
  ) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const ticket = await openTicket(
      nomeSolicitante,
      emailSolicitante,
      titulo,
      descricao,
    );
    return res.status(201).json(ticket);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});
