import { prisma } from "../db/client";
import type { StatusTicket } from "../generated/prisma/client";

export async function createTicket(
  nomeSolicitante: string,
  emailSolicitante: string,
  titulo: string,
  descricao: string,
) {
  return prisma.ticket.create({
    data: { nomeSolicitante, emailSolicitante, titulo, descricao },
  });
}

export async function findTicketById(id: number) {
  return prisma.ticket.findUnique({ where: { id } });
}

export async function findTickets(status?: StatusTicket) {
  return prisma.ticket.findMany({
    where: { status },
    orderBy: { criadoEm: "desc" },
  });
}

export async function assignTicket(id: number, atendenteId: number) {
  return prisma.ticket.update({
    where: { id },
    data: { atendidoPorId: atendenteId, status: "EM_ANDAMENTO" },
  });
}

export async function closeTicket(id: number) {
  return prisma.ticket.update({
    where: { id },
    data: { status: "FECHADO", resolvido: true },
  });
}
