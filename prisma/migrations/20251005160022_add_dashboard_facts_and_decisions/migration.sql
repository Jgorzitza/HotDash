-- CreateTable
CREATE TABLE "DashboardFact" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopDomain" TEXT NOT NULL,
    "factType" TEXT NOT NULL,
    "scope" TEXT,
    "value" JSONB NOT NULL,
    "metadata" JSONB,
    "evidenceUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DecisionLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scope" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "rationale" TEXT,
    "evidenceUrl" TEXT,
    "shopDomain" TEXT,
    "externalRef" TEXT,
    "payload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "DashboardFact_shopDomain_factType_idx" ON "DashboardFact"("shopDomain", "factType");

-- CreateIndex
CREATE INDEX "DashboardFact_createdAt_idx" ON "DashboardFact"("createdAt");

-- CreateIndex
CREATE INDEX "DecisionLog_scope_createdAt_idx" ON "DecisionLog"("scope", "createdAt");
