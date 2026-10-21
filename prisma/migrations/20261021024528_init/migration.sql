-- CreateEnum
CREATE TYPE "TipoConta" AS ENUM ('ATENDENTE', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatusTicket" AS ENUM ('ABERTO', 'EM_ANDAMENTO', 'FECHADO');

-- CreateEnum
CREATE TYPE "Tipocategoria" AS ENUM ('TECNICO', 'FINANCEIRO', 'DUVIDA', 'SOLICITACAO', 'OUTRO');

-- CreateEnum
CREATE TYPE "Urgencia" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "TipoConta" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "nomeSolicitante" VARCHAR(200) NOT NULL,
    "emailSolicitante" VARCHAR(200) NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" "StatusTicket" NOT NULL DEFAULT 'ABERTO',
    "resolvido" BOOLEAN NOT NULL DEFAULT false,
    "atendidoPorId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassificacaoIA" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "categoria" "Tipocategoria" NOT NULL,
    "urgencia" "Urgencia" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassificacaoIA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClassificacaoIA_ticketId_key" ON "ClassificacaoIA"("ticketId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_atendidoPorId_fkey" FOREIGN KEY ("atendidoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassificacaoIA" ADD CONSTRAINT "ClassificacaoIA_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
