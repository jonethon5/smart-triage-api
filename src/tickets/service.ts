import {
  findTicketById,
  assignTicket,
  closeTicket,
  createTicket,
  findTickets,
} from "./queries";
import {
  TicketNotFoundError,
  TicketNotAvailableError,
  TicketForbiddenError,
} from "./errors";

import type { StatusTicket } from "../generated/prisma/client";

export async function getTicket(id: number) {
  const ticket = await findTicketById(id);
  if (!ticket) {
    throw new TicketNotFoundError();
  }
  return ticket;
}

export async function takeTicket(id: number, atendenteId: number) {
  const ticket = await getTicket(id);
  if (ticket.status !== "ABERTO") {
    throw new TicketNotAvailableError();
  }
  return assignTicket(id, atendenteId);
}

export async function finishTicket(id: number, atendenteId: number) {
  const ticket = await getTicket(id);
  if (ticket.status !== "EM_ANDAMENTO") {
    throw new TicketNotAvailableError();
  }

  if (ticket.atendidoPorId !== atendenteId) {
    throw new TicketForbiddenError();
  }
  return closeTicket(id);
}

export async function openTicket(
  nomeSolicitante: string,
  emailSolicitante: string,
  titulo: string,
  descricao: string,
) {
  return createTicket(nomeSolicitante, emailSolicitante, titulo, descricao);
}

export async function listTickets(status?: StatusTicket) {
  return findTickets(status);
}
