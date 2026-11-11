import { Router } from "express";
import { openTicket, listTickets, getTicket } from "./service";
import { authenticate } from "../auth/middleware";
import { StatusTicket } from "../generated/prisma/client";
import { TicketNotFoundError } from "./errors";

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

ticketsRouter.get("/", authenticate, async (req, res) => {
  const { status } = req.query;
  // 1. se veio status (não é undefined) e não é um dos valores válidos:
  if (
    status !== undefined &&
    !Object.values(StatusTicket).includes(status as StatusTicket)
  ) {
    return res.status(400).json({ error: "Status inválido" });
  }
  try {
    // 2. chama listTickets (com o status, se veio)
    const tickets = await listTickets(status as StatusTicket | undefined);
    // 3. responde 200 com a lista
    return res.status(200).json(tickets);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

ticketsRouter.get("/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  // se id não for um inteiro: 400 com { error: "inválido" }
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Id inválido" });
  }
  try {
    // busca com getTicket e responde 200 com o ticket
    const ticket = await getTicket(id);
    return res.status(200).json(ticket);
  } catch (error) {
    // se for TicketNotFoundError: 404 com { error: error.message }
    if (error instanceof TicketNotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});
