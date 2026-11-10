export class TicketNotFoundError extends Error {
  constructor() {
    super("Ticket não encontrado");
    this.name = "TicketNotFoundError";
  }
}

export class TicketNotAvailableError extends Error {
  constructor() {
    super("Ticket não está disponível para esta ação");
    this.name = "TicketNotAvailableError";
  }
}

export class TicketForbiddenError extends Error {
  constructor() {
    super("Você não pode alterar este ticket");
    this.name = "TicketForbiddenError";
  }
}
