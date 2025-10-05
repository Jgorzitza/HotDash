import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface EscalationRecord {
  id: number;
  shopDomain: string;
  value: Array<{
    id: number;
    inboxId: number;
    status: string;
    customerName: string;
    createdAt?: string;
    breachedAt?: string | null;
    lastMessageAt?: string;
    slaBreached?: boolean;
    tags?: string[];
    suggestedReplyId?: string;
    suggestedReply?: string;
    [key: string]: unknown;
  }>;
  metadata: {
    slaMinutes?: number;
    breaches?: Array<{
      conversationId: number;
      breachedAt?: string | null;
      createdAt?: string;
    }>;
    generatedAt?: string;
    [key: string]: unknown;
  } | null;
}

function ensureIso(input: unknown): string | undefined {
  if (typeof input === "string") {
    const date = new Date(input);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return undefined;
}

function toIsoFromSeconds(epochSeconds: unknown): string | undefined {
  if (typeof epochSeconds !== "number") return undefined;
  const millis = epochSeconds * 1000;
  const date = new Date(millis);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function addMinutesIso(startIso: string | undefined, minutes: number | undefined) {
  if (!startIso || typeof minutes !== "number") return undefined;
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return undefined;
  const end = new Date(start.getTime() + minutes * 60 * 1000);
  return end.toISOString();
}

function isIso(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}

async function backfill() {
  const escalations = await prisma.dashboardFact.findMany({
    where: { factType: "chatwoot.escalations" },
    orderBy: { id: "asc" },
  });

  let updateCount = 0;

  for (const fact of escalations) {
    const record = fact as unknown as EscalationRecord;
    const slaMinutes = record.metadata?.slaMinutes;
    let metadataBreaches = Array.isArray(record.metadata?.breaches)
      ? [...(record.metadata?.breaches ?? [])]
      : [];
    let metadataChanged = false;

    const updatedValue = record.value.map((conversation) => {
      const alreadyHasCreated = isIso(conversation.createdAt);
      const alreadyHasBreached = isIso(conversation.breachedAt);

      if (alreadyHasCreated && alreadyHasBreached) {
        return conversation;
      }

      const enriched = { ...conversation };

      if (!alreadyHasCreated) {
        const iso =
          ensureIso(conversation.createdAt) ??
          ensureIso(conversation.lastMessageAt) ??
          toIsoFromSeconds((conversation as any).created_at);
        if (iso) {
          enriched.createdAt = iso;
        }
      }

      if (!alreadyHasBreached && (conversation.slaBreached ?? false)) {
        const startIso = enriched.createdAt ?? ensureIso(conversation.createdAt);
        const breachIso = ensureIso(conversation.breachedAt) ?? addMinutesIso(startIso, slaMinutes);
        if (breachIso) {
          enriched.breachedAt = breachIso;
          metadataBreaches = metadataBreaches.filter(
            (item) => item.conversationId !== conversation.id,
          );
          metadataBreaches.push({
            conversationId: conversation.id,
            breachedAt: breachIso,
            createdAt: startIso ?? breachIso,
          });
          metadataChanged = true;
        }
      }

      return enriched;
    });

    const valueChanged = updatedValue.some((conversation, index) => {
      const original = record.value[index];
      return (
        conversation.createdAt !== original.createdAt ||
        conversation.breachedAt !== original.breachedAt
      );
    });

    if (valueChanged || metadataChanged) {
      updateCount += 1;
      await prisma.dashboardFact.update({
        where: { id: fact.id },
        data: {
          value: updatedValue as unknown as Prisma.InputJsonValue,
          metadata: {
            ...record.metadata,
            breaches: metadataBreaches
              .sort((a, b) => (a.breachedAt ?? "").localeCompare(b.breachedAt ?? "")),
          } as Prisma.InputJsonValue,
        },
      });
    }
  }

  console.log(`Backfilled ${updateCount} chatwoot escalation facts.`);
}

backfill()
  .catch((error) => {
    console.error("Backfill failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
