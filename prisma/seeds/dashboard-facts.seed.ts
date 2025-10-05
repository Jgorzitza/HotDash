import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed script for DashboardFact table
 * Provides baseline data for development and testing
 */

const SHOP_DOMAIN = "dev-shop.myshopify.com";

async function seedDashboardFacts() {
  console.log("Seeding DashboardFact table...");

  // Clear existing facts for dev shop
  await prisma.dashboardFact.deleteMany({
    where: { shopDomain: SHOP_DOMAIN },
  });

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Shopify Sales Summary (daily for past 7 days)
  const salesFacts = [];
  for (let i = 7; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const baseRevenue = 1000 + Math.random() * 500;
    const variance = i === 0 ? -0.3 : Math.random() * 0.2 - 0.1; // Today: 30% drop for anomaly testing

    salesFacts.push({
      shopDomain: SHOP_DOMAIN,
      factType: "shopify.sales.summary",
      scope: "ops",
      value: {
        shopDomain: SHOP_DOMAIN,
        totalRevenue: parseFloat((baseRevenue * (1 + variance)).toFixed(2)),
        currency: "USD",
        orderCount: Math.floor(10 + Math.random() * 20),
        topSkus: [
          {
            sku: "SKU-001",
            title: "Product A",
            quantity: Math.floor(5 + Math.random() * 10),
            revenue: parseFloat((200 + Math.random() * 100).toFixed(2)),
          },
          {
            sku: "SKU-002",
            title: "Product B",
            quantity: Math.floor(3 + Math.random() * 8),
            revenue: parseFloat((150 + Math.random() * 80).toFixed(2)),
          },
        ],
        pendingFulfillment: i === 0
          ? [
              {
                orderId: "gid://shopify/Order/1001",
                name: "#1001",
                displayStatus: "UNFULFILLED",
                createdAt: dayAgo.toISOString(),
              },
            ]
          : [],
        generatedAt: date.toISOString(),
      },
      metadata: {
        orderCount: Math.floor(10 + Math.random() * 20),
        windowDays: 1,
        generatedAt: date.toISOString(),
      },
      createdAt: date,
    });
  }

  await prisma.dashboardFact.createMany({ data: salesFacts });
  console.log(`✓ Created ${salesFacts.length} sales summary facts`);

  // Chatwoot Escalations (simulating SLA breaches)
  const escalationFacts = [
    {
      shopDomain: SHOP_DOMAIN,
      factType: "chatwoot.escalations",
      scope: "ops",
      value: [
        {
          id: 101,
          inboxId: 1,
          status: "open",
          customerName: "Jane Doe",
          lastMessageAt: weekAgo.toISOString(),
          slaBreached: true,
          tags: ["escalation", "urgent"],
          suggestedReplyId: "template-1",
          suggestedReply: "We're looking into this issue and will update you shortly.",
        },
        {
          id: 102,
          inboxId: 1,
          status: "pending",
          customerName: "John Smith",
          lastMessageAt: dayAgo.toISOString(),
          slaBreached: true,
          tags: ["escalation"],
          suggestedReplyId: "template-1",
          suggestedReply: "Thank you for your patience. Our team is investigating.",
        },
      ],
      metadata: {
        slaMinutes: 60,
        count: 2,
        generatedAt: now.toISOString(),
      },
      createdAt: now,
    },
  ];

  await prisma.dashboardFact.createMany({ data: escalationFacts });
  console.log(`✓ Created ${escalationFacts.length} escalation facts`);

  // GA Sessions Anomalies
  const gaFacts = [
    {
      shopDomain: SHOP_DOMAIN,
      factType: "ga.sessions.anomalies",
      scope: "ops",
      value: [
        {
          landingPage: "/products/shoes",
          sessions: 320,
          wowDelta: -0.25,
          isAnomaly: true,
        },
        {
          landingPage: "/products/bags",
          sessions: 180,
          wowDelta: -0.15,
          isAnomaly: false,
        },
        {
          landingPage: "/collections/sale",
          sessions: 450,
          wowDelta: 0.1,
          isAnomaly: false,
        },
      ],
      metadata: {
        propertyId: "GA4_TEST_PROPERTY",
        range: {
          start: weekAgo.toISOString().slice(0, 10),
          end: now.toISOString().slice(0, 10),
        },
        generatedAt: now.toISOString(),
      },
      createdAt: now,
    },
  ];

  await prisma.dashboardFact.createMany({ data: gaFacts });
  console.log(`✓ Created ${gaFacts.length} GA session anomaly facts`);

  // Inventory Coverage
  const inventoryFacts = [
    {
      shopDomain: SHOP_DOMAIN,
      factType: "shopify.inventory.coverage",
      scope: "ops",
      value: [
        {
          sku: "SKU-001",
          title: "Product A",
          currentInventory: 15,
          velocityPerDay: 2.5,
          daysOfCover: 6,
          isLowStock: true,
          recommendedReorder: 35,
        },
        {
          sku: "SKU-002",
          title: "Product B",
          currentInventory: 50,
          velocityPerDay: 1.2,
          daysOfCover: 42,
          isLowStock: false,
          recommendedReorder: 0,
        },
        {
          sku: "SKU-003",
          title: "Product C",
          currentInventory: 8,
          velocityPerDay: 3.0,
          daysOfCover: 2.67,
          isLowStock: true,
          recommendedReorder: 42,
        },
      ],
      metadata: {
        lowStockThresholdDays: 7,
        velocityWindowDays: 14,
        generatedAt: now.toISOString(),
      },
      createdAt: now,
    },
  ];

  await prisma.dashboardFact.createMany({ data: inventoryFacts });
  console.log(`✓ Created ${inventoryFacts.length} inventory coverage facts`);

  // Fulfillment Issues
  const fulfillmentFacts = [
    {
      shopDomain: SHOP_DOMAIN,
      factType: "shopify.fulfillment.issues",
      scope: "ops",
      value: [
        {
          orderId: "gid://shopify/Order/1001",
          name: "#1001",
          displayStatus: "UNFULFILLED",
          createdAt: dayAgo.toISOString(),
          ageHours: 24,
        },
        {
          orderId: "gid://shopify/Order/1002",
          name: "#1002",
          displayStatus: "PARTIAL",
          createdAt: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
          ageHours: 36,
        },
      ],
      metadata: {
        processingWindowHours: 24,
        issueRate: 0.15,
        totalOrders: 15,
        generatedAt: now.toISOString(),
      },
      createdAt: now,
    },
  ];

  await prisma.dashboardFact.createMany({ data: fulfillmentFacts });
  console.log(`✓ Created ${fulfillmentFacts.length} fulfillment issue facts`);

  console.log("✓ DashboardFact seeding complete");
}

async function seedDecisionLogs() {
  console.log("Seeding DecisionLog table...");

  // Clear existing decisions for dev shop
  await prisma.decisionLog.deleteMany({
    where: { shopDomain: SHOP_DOMAIN },
  });

  const now = new Date();

  const decisions = [
    {
      scope: "ops",
      actor: "operator@example.com",
      action: "escalate_conversation",
      rationale: "SLA breach exceeded 90 minutes, customer flagged as priority",
      evidenceUrl: null,
      shopDomain: SHOP_DOMAIN,
      externalRef: "chatwoot:101",
      payload: {
        conversationId: 101,
        inboxId: 1,
        tags: ["escalation", "urgent"],
      },
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      scope: "ops",
      actor: "operator@example.com",
      action: "mark_low_stock_intentional",
      rationale: "Seasonal item, intentionally reducing inventory before end of season",
      evidenceUrl: null,
      shopDomain: SHOP_DOMAIN,
      externalRef: "shopify:SKU-003",
      payload: {
        sku: "SKU-003",
        currentInventory: 8,
        daysOfCover: 2.67,
      },
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    },
    {
      scope: "ops",
      actor: "system",
      action: "auto_flag_anomaly",
      rationale: "Revenue drop exceeds 20% threshold",
      evidenceUrl: null,
      shopDomain: SHOP_DOMAIN,
      externalRef: null,
      payload: {
        factType: "shopify.sales.summary",
        anomalySeverity: "critical",
        currentRevenue: 700,
        baselineRevenue: 1000,
        percentDrop: -30,
      },
      createdAt: now,
    },
  ];

  await prisma.decisionLog.createMany({ data: decisions });
  console.log(`✓ Created ${decisions.length} decision log entries`);

  console.log("✓ DecisionLog seeding complete");
}

async function main() {
  try {
    await seedDashboardFacts();
    await seedDecisionLogs();
    console.log("\n✓ All seed data created successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
