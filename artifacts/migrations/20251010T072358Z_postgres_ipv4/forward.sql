-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardFact" (
    "id" SERIAL NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "factType" TEXT NOT NULL,
    "scope" TEXT,
    "value" JSONB NOT NULL,
    "metadata" JSONB,
    "evidenceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionLog" (
    "id" SERIAL NOT NULL,
    "scope" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "rationale" TEXT,
    "evidenceUrl" TEXT,
    "shopDomain" TEXT,
    "externalRef" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DashboardFact_shopDomain_factType_idx" ON "DashboardFact"("shopDomain", "factType");

-- CreateIndex
CREATE INDEX "DashboardFact_createdAt_idx" ON "DashboardFact"("createdAt");

-- CreateIndex
CREATE INDEX "DecisionLog_scope_createdAt_idx" ON "DecisionLog"("scope", "createdAt");

