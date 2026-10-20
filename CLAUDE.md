# CLAUDE.md

Regras de uso de IA (Claude Code e similares) neste repositório.

## O que a IA pode fazer
- Explicar conceitos, sintaxe e erros
- Revisar código que eu já escrevi, apontando problemas
- Sugerir correções pontuais em código já existente (não lógica nova)
- Ajudar com documentação (README, comentários, este arquivo)
- Gerar arquivos de configuração/infraestrutura sem lógica de negócio
  (Dockerfile, docker-compose.yml, configs de ESLint/Prettier/tsconfig)

## O que a IA NÃO pode fazer
- Escrever lógica de negócio nova (services, regras de triagem, cálculo
  de taxa de acerto da IA, validações)
- Completar um teste que está falhando
- Escrever a integração com a API do Gemini (classificador.ts) — essa
  lógica específica sou eu que decido e escrevo
- Decidir o conjunto de tickets de teste usado na avaliação de acerto,
  nem a classificação "correta" de cada um — isso precisa vir de mim,
  senão a avaliação perde o sentido (eu estaria validando a IA com
  dados que a própria IA ajudou a montar)

## Por quê
Esse projeto é peça de portfólio. Preciso conseguir explicar qualquer
decisão técnica numa entrevista, incluindo o porquê da taxa de acerto
da classificação ser o número que é. Código que eu não entendo não
serve esse propósito, mesmo que funcione.
