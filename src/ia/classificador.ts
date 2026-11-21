import { TipoCategoria, Urgencia } from "../generated/prisma/client";
import { GoogleGenAI, ApiError } from "@google/genai";

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export class ClassificacaoInvalidaError extends Error {
  // constructor, super("Resposta da IA inválida"), this.name (igual ao tickets/errors.ts)
  constructor() {
    super("Resposta da IA inválida");
    this.name = "ClassificacaoInvalidaError";
  }
}

export function validarClassificacao(dados: unknown) {
  // 1. se dados não for um objeto (ou for null): lança ClassificacaoInvalidaError
  if (typeof dados !== "object" || dados === null) {
    throw new ClassificacaoInvalidaError();
  }
  // 2. pega dados.categoria e dados.urgencia
  const { categoria, urgencia } = dados as Record<string, unknown>;
  // 3. se categoria não estiver em Object.values(TipoCategoria): lança o erro
  if (!Object.values(TipoCategoria).includes(categoria as TipoCategoria)) {
    throw new ClassificacaoInvalidaError();
  }
  // 4. se urgencia não estiver em Object.values(Urgencia): lança o erro
  if (!Object.values(Urgencia).includes(urgencia as Urgencia)) {
    throw new ClassificacaoInvalidaError();
  }
  // 5. devolve { categoria, urgencia } já com o tipo certo
  return {
    categoria: categoria as TipoCategoria,
    urgencia: urgencia as Urgencia,
  };
}

function montarPrompt(titulo: string, descricao: string): string {
  return `Você classifica tickets de suporte de uma empresa e devolve a categoria e a urgência de cada um

Categorias válidas (escolha exatamente uma):
- TECNICO: problemas com sistema, erro, bug, acesso, equipamento que não funciona.
- FINANCEIRO: cobrança, pagamento, reembolso, nota fiscal.
- DUVIDA: pergunta, dúvida, esclarecimento, informação.
- SOLICITACAO: pedido, requisição, solicitação de serviço.
- OUTRO: assuntos que não se encaixam em nenhuma das categorias acima.

Urgências válidas (escolha exatamente uma):
- BAIXA: pode esperar; sem impacto no trabalho de ninguém.
- MEDIA: impacto no trabalho de uma pessoa, mas não impede que ela continue trabalhando.
- ALTA: impacto no trabalho de várias pessoas, mas não impede que a empresa continue funcionando.
- URGENTE: perda de dinheiro ou sistema parado para a empresa inteira.

Responda SOMENTE com um JSON neste formato, sem nenhum texto em volta:
{"categoria": "<uma das categorias>", "urgencia": "<uma das urgências>"}

Ticket: 
Título: ${titulo}
Descrição: ${descricao}`;
}

const MODELO = "gemini-3.5-flash";

export async function classificarTicket(titulo: string, descricao: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não encontrada");
  }

  const ai = new GoogleGenAI({ apiKey });

  const MAX_TENTATIVAS = 3;

  let response;
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      response = await ai.models.generateContent({
        model: MODELO,
        contents: montarPrompt(titulo, descricao),
        config: { responseMimeType: "application/json" },
      });
      break;
    } catch (error) {
      const ehUltima = tentativa === MAX_TENTATIVAS;
      // Só o 503 (servidor sobrecarregado) é passageiro e vale repetir. O 429 é
      // cota diária esgotada: tentar de novo em segundos não devolve a cota.
      const ehOcupado = error instanceof ApiError && error.status === 503;

      if (!ehOcupado || ehUltima) {
        throw error;
      }
      // Espera crescente (3 s, depois 6 s) para dar tempo de o servidor aliviar,
      // em vez de repetir logo em seguida e cair na mesma sobrecarga.
      await esperar(3000 * tentativa);
    }
  }

  if (!response) {
    throw new ClassificacaoInvalidaError();
  }

  // A IA devolve texto livre: mesmo pedindo JSON, pode vir vazio, quebrado ou
  // com uma categoria inventada. Por isso nada vai ao banco sem validação.
  const texto = response.text;

  if (!texto) {
    throw new ClassificacaoInvalidaError();
  }

  let dados: unknown;
  try {
    dados = JSON.parse(texto);
  } catch {
    throw new ClassificacaoInvalidaError();
  }

  return validarClassificacao(dados);
}
