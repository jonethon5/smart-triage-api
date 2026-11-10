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
