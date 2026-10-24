import { prisma } from "../db/client";
import {TipoConta} from "../generated/prisma/client";

// Retorna o usuário com esse email, ou null se não existir (email é @unique no schema)
export async function findUserByEmail(email: string) {
  return prisma.usuario.findUnique({ where: { email } });
}

// Espera a senha já em hash — quem chama é responsável por gerar o hash antes
export async function createUser(email: string, senha: string, role: TipoConta) {
  return prisma.usuario.create({ data: { email, senha, role } });
}
