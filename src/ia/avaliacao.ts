import { classificarTicket } from "./classificador";
import type { TipoCategoria, Urgencia } from "../generated/prisma/client";

type ItemGabarito = {
  titulo: string;
  descricao: string;
  categoriaEsperada: TipoCategoria;
  urgenciaEsperada: Urgencia;
};

const gabarito: ItemGabarito[] = [
  // seus tickets aqui
  {
    titulo: "Impressora do setor não imprime",
    descricao:
      "A impressora do financeiro parou de funcionar e as 6 pessoas do setor não conseguem imprimir os boletos do dia, mas o resto da empresa está operando normalmente.",
    categoriaEsperada: "TECNICO",
    urgenciaEsperada: "ALTA",
  },
  {
    titulo: "Solicitação de novo notebook",
    descricao:
      "Preciso de um notebook novo para o estagiário que começa na próxima semana. Não há pressa, pode ser dentro do mês.",
    categoriaEsperada: "SOLICITACAO",
    urgenciaEsperada: "BAIXA",
  },
  {
    titulo: "Pagamentos via Pix não estão sendo confirmados",
    descricao:
      "Desde cedo nenhum pagamento via Pix está sendo confirmado no checkout. Os clientes pagam, mas o pedido não é liberado e estamos perdendo vendas.",
    categoriaEsperada: "FINANCEIRO",
    urgenciaEsperada: "URGENTE",
  },
  {
    titulo: "Não consigo abrir minha planilha de relatórios",
    descricao:
      "O Excel trava toda vez que abro minha planilha de relatórios mensais. Consigo trabalhar em outras tarefas enquanto isso, mas preciso resolver até o fim da semana.",
    categoriaEsperada: "TECNICO",
    urgenciaEsperada: "MEDIA",
  },
  {
    titulo: "Sugestão de decoração para a copa",
    descricao:
      "Gostaria de sugerir que a gente colocasse algumas plantas na copa para deixar o ambiente mais agradável.",
    categoriaEsperada: "OUTRO",
    urgenciaEsperada: "BAIXA",
  },
  {
    titulo: "Acesso à pasta",
    descricao:
      "Vocês conseguem liberar acesso à pasta do Financeiro para alguém de fora da empresa? Só quero saber se é possível e como funciona, antes de abrir um pedido.",
    categoriaEsperada: "DUVIDA",
    urgenciaEsperada: "BAIXA",
  },
  // DUVIDA com palavra-chave técnica (armadilha para TECNICO)
  {
    titulo: "VPN no computador pessoal",
    descricao:
      "A VPN da empresa funciona em computador pessoal ou só nos notebooks fornecidos pela empresa?",
    categoriaEsperada: "DUVIDA",
    urgenciaEsperada: "BAIXA",
  },
  // Curtos e vagos, sem pista de urgência
  {
    titulo: "Sistema lento",
    descricao: "O sistema está muito lento hoje.",
    categoriaEsperada: "TECNICO",
    urgenciaEsperada: "MEDIA",
  },
  {
    titulo: "Não consigo entrar",
    descricao: "Não consigo entrar.",
    categoriaEsperada: "TECNICO",
    urgenciaEsperada: "MEDIA",
  },
  {
    titulo: "Preciso de ajuda",
    descricao: "Preciso de ajuda, alguém pode me ligar?",
    categoriaEsperada: "OUTRO",
    urgenciaEsperada: "BAIXA",
  },
  // Grave contado com calma
  {
    titulo: "Pedidos com erro",
    descricao:
      "Bom dia. Reparei que a tela de pedidos está devolvendo erro para todo mundo desde as 9h. Quando puderem dar uma olhada, agradeço.",
    categoriaEsperada: "TECNICO",
    urgenciaEsperada: "URGENTE",
  },
  // Banal escrito aos gritos
  {
    titulo: "URGENTE!!! TROCAR O MOUSE",
    descricao:
      "PRECISO TROCAR MEU MOUSE POR UM SEM FIO HOJE!!! O ATUAL FUNCIONA NORMAL, MAS QUERO O NOVO O QUANTO ANTES!!!",
    categoriaEsperada: "SOLICITACAO",
    urgenciaEsperada: "BAIXA",
  },
  // Dois assuntos misturados
  {
    titulo: "Cobrança errada e portal com erro",
    descricao:
      "Fui cobrado R$ 480 a mais na fatura deste mês e, quando tento abrir a contestação no portal, aparece erro 500.",
    categoriaEsperada: "FINANCEIRO",
    urgenciaEsperada: "MEDIA",
  },
  // ALTA sem dica explícita
  {
    titulo: "Wi-Fi do 3º andar",
    descricao:
      "O Wi-Fi do terceiro andar está fora desde as 9h. O pessoal de lá está usando o celular como roteador.",
    categoriaEsperada: "TECNICO",
    urgenciaEsperada: "ALTA",
  },
  {
    titulo: "Chamados não abre",
    descricao:
      "Cinco máquinas do atendimento não abrem o sistema de chamados desde a atualização de ontem. Estamos anotando numa planilha.",
    categoriaEsperada: "TECNICO",
    urgenciaEsperada: "ALTA",
  },
];

async function avaliar() {
  let acertosCategoria = 0;
  let acertosUrgencia = 0;
  let falhas = 0;

  for (const item of gabarito) {
    let resultado;

    // 1. tenta classificar (try/catch por item)
    try {
      resultado = await classificarTicket(item.titulo, item.descricao);
    } catch (error) {
      // 2. se der erro (503...): falhas++ e segue para o próximo
      falhas++;
      console.error(`Falha em "${item.titulo}":`, error);
      continue;
    }

    // 3. compara categoria e urgência com as esperadas
    const acertouCategoria = resultado.categoria === item.categoriaEsperada;
    const acertouUrgencia = resultado.urgencia === item.urgenciaEsperada;

    if (acertouCategoria) acertosCategoria++;
    if (acertouUrgencia) acertosUrgencia++;

    // útil para ver onde a IA erra
    if (!acertouCategoria || !acertouUrgencia) {
      console.error(
        `✗ "${item.titulo}"\n` +
          `   categoria: esperada ${item.categoriaEsperada}, veio ${resultado.categoria}\n` +
          `   urgência:  esperada ${item.urgenciaEsperada}, veio ${resultado.urgencia}`,
      );
    }
  }

  // 4. total avaliado = gabarito.length - falhas
  const totalAvaliado = gabarito.length - falhas;

  // 5. imprime os percentuais e quantas falharam
  if (totalAvaliado === 0) {
    console.log(
      `Nenhum ticket avaliado: todas as ${falhas} chamadas falharam.`,
    );
    return;
  }

  const pctCategoria = ((acertosCategoria / totalAvaliado) * 100).toFixed(1);
  const pctUrgencia = ((acertosUrgencia / totalAvaliado) * 100).toFixed(1);

  console.log("\n--- Resultado ---");
  console.log(
    `Categoria: ${acertosCategoria}/${totalAvaliado} (${pctCategoria}%)`,
  );
  console.log(
    `Urgência:  ${acertosUrgencia}/${totalAvaliado} (${pctUrgencia}%)`,
  );
  console.log(`Falhas de chamada: ${falhas}/${gabarito.length}`);
}

avaliar();
