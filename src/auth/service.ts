import bcrypt from "bcrypt";
import { findUserByEmail, createUser } from "./queries";
import { TipoConta } from "../generated/prisma/client";
import jwt from "jsonwebtoken";

// Custo do bcrypt: cada +1 dobra o tempo de hash. 10 é o padrão recomendado
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// O bcrypt extrai o salt do próprio hash, então não precisa guardá-lo separado
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
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("Esse email já está cadastrado");
  }

  // Nunca salva a senha em texto puro no banco
  const passwordHash = await hashPassword(senha);
  const newUser = await createUser(email, passwordHash, role);

  // Remove o hash da senha antes de devolver o usuário
  const { senha: _senha, ...safeUser } = newUser;

  return safeUser;
}

export async function loginUser(email: string, senha: string) {
  const existingUser = await findUserByEmail(email);

  // Mesma mensagem para email inexistente e senha errada, para não revelar
  // quais emails estão cadastrados
  if (!existingUser) {
    throw new Error("Credenciais inválidas");
  }

  const isPasswordValid = await comparePassword(senha, existingUser.senha);
  if (!isPasswordValid) {
    throw new Error("Credenciais inválidas");
  }

  const { senha: _senha, ...safeUser } = existingUser;
  return safeUser;
}

export async function generateAccessToken(id: number, role: TipoConta) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Segredo não encontrado");
  }
  const payload = { id, role };
  const token = jwt.sign(payload, secret, { expiresIn: "15m" });
  return token;
}
