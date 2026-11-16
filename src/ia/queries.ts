import { prisma } from "../db/client";
import type { TipoCategoria, Urgencia } from "../generated/prisma/client";

export async function saveClassificacao(
  ticketId: number,
  categoria: TipoCategoria,
  urgencia: Urgencia,
) {
  return prisma.classificacaoIA.create({
    data: { ticketId, categoria, urgencia },
  });
}
