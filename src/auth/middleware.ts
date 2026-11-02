import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({ error: "Autorização necessária" });
  }
  const token = authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token ausente" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Erro de configuração do servidor" });
  }
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "string") {
      return res.status(401).json({ error: "Token inválido" });
    }
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
}
