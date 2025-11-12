-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "photoURL" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NotaFiscal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chave_acesso" TEXT NOT NULL,
    "numero_nf" TEXT NOT NULL,
    "emitente_nome" TEXT,
    "emitente_cnpj" TEXT,
    "data_emissao" DATETIME NOT NULL,
    "valor_total" REAL NOT NULL,
    "url_imagem" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criado_por_uid" TEXT NOT NULL,
    CONSTRAINT "NotaFiscal_criado_por_uid_fkey" FOREIGN KEY ("criado_por_uid") REFERENCES "User" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NotaFiscal_chave_acesso_key" ON "NotaFiscal"("chave_acesso");
