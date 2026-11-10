import { prisma } from "../db/client";

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
