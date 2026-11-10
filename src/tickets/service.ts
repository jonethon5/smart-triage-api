import { findTicketById, assignTicket, closeTicket } from "./queries";
import {
  TicketNotFoundError,
  TicketNotAvailableError,
  TicketForbiddenError,
} from "./errors";

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
