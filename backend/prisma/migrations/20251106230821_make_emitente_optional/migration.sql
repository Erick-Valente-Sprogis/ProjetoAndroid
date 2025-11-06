-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NotaFiscal" (
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
INSERT INTO "new_NotaFiscal" ("chave_acesso", "criado_em", "criado_por_uid", "data_emissao", "emitente_cnpj", "emitente_nome", "id", "numero_nf", "url_imagem", "valor_total") SELECT "chave_acesso", "criado_em", "criado_por_uid", "data_emissao", "emitente_cnpj", "emitente_nome", "id", "numero_nf", "url_imagem", "valor_total" FROM "NotaFiscal";
DROP TABLE "NotaFiscal";
ALTER TABLE "new_NotaFiscal" RENAME TO "NotaFiscal";
CREATE UNIQUE INDEX "NotaFiscal_chave_acesso_key" ON "NotaFiscal"("chave_acesso");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
