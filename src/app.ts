import express, { NextFunction, Request, Response } from "express";
import { authRouter } from "./auth/routes";
import { ticketsRouter } from "./tickets/routes";

export const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/tickets", ticketsRouter);

// 1. rota que não existe
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// 2. erro inesperado (o Express reconhece pelo 4º parâmetro)
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  // JSON malformado no corpo: o body parser marca o erro com este type
  if (
    err instanceof SyntaxError &&
    "type" in err &&
    err.type === "entity.parse.failed"
  ) {
    res.status(400).json({ error: "JSON inválido" });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Erro interno" });
});
