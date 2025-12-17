/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `codes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "codes_code_key" ON "codes"("code");

-- CreateIndex
CREATE INDEX "codes_code_idx" ON "codes"("code");
