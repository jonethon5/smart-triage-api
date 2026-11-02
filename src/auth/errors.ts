export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("Esse email já está cadastrado");
    this.name = "EmailAlreadyRegisteredError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Credenciais inválidas");
    this.name = "InvalidCredentialsError";
  }
}
