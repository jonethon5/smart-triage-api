import { TipoCategoria, Urgencia } from "../generated/prisma/client";

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
