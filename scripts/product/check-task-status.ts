import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkTaskStatus() {
  const task = await prisma.taskAssignment.findUnique({
    where: { taskId: "PRODUCT-DOCS-001" },
  });

  console.log("PRODUCT-DOCS-001 Status:");
  console.log("=".repeat(60));
  console.log(JSON.stringify(task, null, 2));

  await prisma.$disconnect();
}

checkTaskStatus().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

