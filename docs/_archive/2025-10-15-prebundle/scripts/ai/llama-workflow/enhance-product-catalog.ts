import { getConfig } from "./src/config.js";
import fs from "node:fs/promises";
import path from "node:path";

console.log("🚀 Enhancing Hot Rodan Product Catalog for RAG\n");

async function enhanceProductCatalog() {
  const config = getConfig();
  const indexPath = path.join(
    config.LOG_DIR,
    "indexes",
    "2025-10-12T0324",
    "operator_knowledge.json",
  );

  // Load existing index
  const indexData = await fs.readFile(indexPath, "utf-8");
  const index = JSON.parse(indexData);

  console.log(`✓ Loaded index with ${index.document_count} documents`);

  // Filter to product pages
  const products = index.documents.filter((doc: any) =>
    doc.metadata.url.includes("/products/"),
  );

  console.log(`✓ Found ${products.length} product pages\n`);

  // Create enhanced product knowledge base
  const enhancedProducts = products.map((product: any) => {
    const url = product.metadata.url;
    const slug = url.split("/products/")[1];
    const name = slug.replace(/-/g, " ").replace(/an(\d+)/gi, "AN-$1");

    // Extract product category
    let category = "Other";
    if (name.toLowerCase().includes("hose")) category = "PTFE Hose";
    else if (
      name.toLowerCase().includes("fitting") ||
      name.toLowerCase().includes("adapter")
    )
      category = "Fittings & Adapters";
    else if (name.toLowerCase().includes("pump")) category = "Fuel Pumps";
    else if (name.toLowerCase().includes("filter")) category = "Filters";
    else if (name.toLowerCase().includes("bundle")) category = "Bundle Deals";
    else if (
      name.toLowerCase().includes("tool") ||
      name.toLowerCase().includes("wrench") ||
      name.toLowerCase().includes("shear")
    )
      category = "Tools";

    // Extract AN sizes if present
    const anSizes: string[] = [];
    if (name.includes("AN-6") || name.includes("AN6")) anSizes.push("AN-6");
    if (name.includes("AN-8") || name.includes("AN8")) anSizes.push("AN-8");
    if (name.includes("AN-10") || name.includes("AN10")) anSizes.push("AN-10");

    // Determine material
    let material = "Unknown";
    if (name.toLowerCase().includes("stainless"))
      material = "Stainless Steel Braided";
    else if (name.toLowerCase().includes("nylon")) material = "Nylon Braided";
    else if (name.toLowerCase().includes("aluminum")) material = "Aluminum";

    // Create Q&A format knowledge
    const qa = {
      productName: name,
      category,
      url,
      sizes: anSizes.length > 0 ? anSizes : undefined,
      material: material !== "Unknown" ? material : undefined,
      questions: [
        {
          q: `What is ${name}?`,
          a: `${name} is a ${category.toLowerCase()} product from Hot Rod AN LLC.`,
        },
        {
          q: `Where can I find ${name}?`,
          a: `You can find ${name} at ${url}`,
        },
      ],
    };

    if (anSizes.length > 0) {
      qa.questions.push({
        q: `What sizes does ${name} come in?`,
        a: `${name} is available in ${anSizes.join(", ")} sizes.`,
      });
    }

    if (category === "PTFE Hose") {
      qa.questions.push({
        q: `What is ${name} used for?`,
        a: `${name} is used for fuel system lines in performance vehicles. PTFE (Teflon) lined hose is compatible with E85, gasoline, diesel, and most racing fuels.`,
      });
    }

    return {
      ...qa,
      originalText: product.text.slice(0, 1000), // Keep first 1000 chars for context
    };
  });

  // Group by category
  const byCategory: Record<string, any[]> = {};
  enhancedProducts.forEach((p) => {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  });

  console.log("📊 Products by Category:");
  Object.entries(byCategory).forEach(([cat, prods]) => {
    console.log(`   ${cat}: ${prods.length} products`);
  });

  // Create output directory
  const outputDir = path.join(config.LOG_DIR, "product-catalog");
  await fs.mkdir(outputDir, { recursive: true });

  // Write enhanced catalog
  const catalogPath = path.join(outputDir, "enhanced-product-catalog.json");
  await fs.writeFile(
    catalogPath,
    JSON.stringify(
      {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        total_products: enhancedProducts.length,
        categories: Object.keys(byCategory),
        products: enhancedProducts,
      },
      null,
      2,
    ),
  );

  console.log(`\n✓ Enhanced catalog saved to: ${catalogPath}`);

  // Create Q&A text format for RAG
  const qaText = enhancedProducts
    .map((p) => {
      return [
        `# ${p.productName}`,
        `**Category:** ${p.category}`,
        p.sizes ? `**Available Sizes:** ${p.sizes.join(", ")}` : "",
        p.material ? `**Material:** ${p.material}` : "",
        "",
        "## Common Questions:",
        ...p.questions.map((q: any) => `\n**Q: ${q.q}**\nA: ${q.a}`),
        "",
        `**Product URL:** ${p.url}`,
        "",
        "---",
        "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const qaPath = path.join(outputDir, "product-qa-knowledge.md");
  await fs.writeFile(qaPath, qaText);

  console.log(`✓ Q&A knowledge base saved to: ${qaPath}`);
  console.log(
    `✓ Total Q&A entries: ${enhancedProducts.reduce((sum: number, p: any) => sum + p.questions.length, 0)}`,
  );

  // Create product summary
  const summary = {
    timestamp: new Date().toISOString(),
    total_products: enhancedProducts.length,
    categories: byCategory,
    stats: {
      with_an_sizes: enhancedProducts.filter((p: any) => p.sizes).length,
      with_material_info: enhancedProducts.filter((p: any) => p.material)
        .length,
      total_qa_pairs: enhancedProducts.reduce(
        (sum: number, p: any) => sum + p.questions.length,
        0,
      ),
    },
  };

  const summaryPath = path.join(outputDir, "catalog-summary.json");
  await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

  console.log(`✓ Summary saved to: ${summaryPath}`);

  console.log("\n✅ Product catalog enhancement complete!");

  return {
    catalogPath,
    qaPath,
    summaryPath,
    stats: summary.stats,
  };
}

enhanceProductCatalog().catch(console.error);
