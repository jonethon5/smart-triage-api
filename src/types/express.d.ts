import type { TipoConta } from "../generated/prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: TipoConta };
    }
  }
}