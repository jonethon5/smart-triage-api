import bcrypt from "bcrypt";
import { buscarUsuarioPorEmail, criarUsuario } from "./queries";
import { TipoConta } from "../generated/prisma/client";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function registerUser(
  email: string,
  senha: string,
  role: TipoConta,
) {
  const existingUser = await buscarUsuarioPorEmail(email);
  if (existingUser) {
    throw new Error("Esse email já está cadastrado");
  }

  const passwordHash = await hashPassword(senha);
  const newUser = await criarUsuario(email, passwordHash, role);

  const { senha: _senha, ...safeUser } = newUser;

  return safeUser;
}
