import { prisma } from "../db/client";
import {TipoConta} from "../generated/prisma/client";

export async function buscarUsuarioPorEmail(email: string) {
  return prisma.usuario.findUnique({ where: { email } });
}

export async function criarUsuario(email: string, senha: string, role: TipoConta) {
  return prisma.usuario.create({ data: { email, senha, role } });
}
