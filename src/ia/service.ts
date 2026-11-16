import { classificarTicket } from "./classificador";
import { saveClassificacao } from "./queries";

export async function classificarESalvar(
  ticketId: number,
  titulo: string,
  descricao: string,
) {
  // 1. classifica com classificarTicket(titulo, descricao)
  const { categoria, urgencia } = await classificarTicket(titulo, descricao);
  // 2. salva com saveClassificacao(ticketId, ...)
  await saveClassificacao(ticketId, categoria, urgencia);
}
