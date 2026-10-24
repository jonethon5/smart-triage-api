import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// No Prisma 7 o client precisa de um driver adapter; aqui usamos o do Postgres (pg)
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Instância única do client, compartilhada por toda a aplicação
export const prisma = new PrismaClient({ adapter });
