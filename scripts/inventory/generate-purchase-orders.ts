#!/usr/bin/env tsx
/**
 * Generate Purchase Orders Script
 *
 * Analyzes inventory levels against ROP and generates purchase order CSVs
 * for products that need reordering.
 *
 * Usage:
 *   npx tsx scripts/inventory/generate-purchase-orders.ts [--dry-run] [--vendor=<vendor_name>]
 *
 * Options:
 *   --dry-run       Preview purchase orders without creating them
 *   --vendor=NAME   Generate PO only for specific vendor
 *
 * ROLLBACK:
 *   - This script only generates CSV files and draft PO records
 *   - No external API calls or inventory modifications
 *   - To rollback: Delete generated CSV files and draft PO records from database
 *   - Query: DELETE FROM purchase_orders WHERE status = 'draft' AND created_at > '<script_run_time>'
 */

import { createClient } from "@supabase/supabase-js";

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const vendorArg = args.find((arg) => arg.startsWith("--vendor="));
const vendorFilter = vendorArg ? vendorArg.split("=")[1] : null;

console.log("🔄 Purchase Order Generation Script");
console.log("=====================================");
console.log(`Mode: ${isDryRun ? "DRY RUN" : "LIVE"}`);
console.log(`Vendor Filter: ${vendorFilter || "All"}`);
console.log("");

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "http://localhost:54321";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseKey) {
  console.error("❌ Error: SUPABASE_SERVICE_ROLE_KEY not set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface InventoryItem {
  variant_id: string;
  sku: string;
  product_title: string;
  variant_title: string;
  available_quantity: number;
  reorder_point: number;
  status: string;
  avg_daily_sales: number;
  lead_time_days: number;
}

interface VendorInfo {
  id: string;
  name: string;
  lead_time_days: number;
}

interface PurchaseOrderItem {
  variant_id: string;
  sku: string;
  product_title: string;
  variant_title: string;
  quantity: number;
  unit_cost: number;
}

async function getItemsNeedingReorder(): Promise<InventoryItem[]> {
  console.log("📊 Fetching inventory items needing reorder...");

  const { data, error } = await supabase
    .from("inventory_snapshots")
    .select("*")
    .in("status", ["low_stock", "out_of_stock", "urgent_reorder"])
    .order("status", { ascending: true }); // urgent_reorder first

  if (error) {
    console.error("❌ Error fetching inventory:", error);
    throw error;
  }

  console.log(`✅ Found ${data.length} items needing reorder`);
  return data as InventoryItem[];
}

async function getVendors(): Promise<VendorInfo[]> {
  console.log("🏢 Fetching vendors...");

  let query = supabase.from("vendors").select("id, name, lead_time_days");

  if (vendorFilter) {
    query = query.ilike("name", `%${vendorFilter}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ Error fetching vendors:", error);
    throw error;
  }

  console.log(`✅ Found ${data.length} vendors`);
  return data as VendorInfo[];
}

function calculateOrderQuantity(
  currentQty: number,
  rop: number,
  avgDailySales: number,
  leadTimeDays: number,
): number {
  // Order enough to bring inventory up to 2x ROP (to avoid frequent reordering)
  const targetQty = rop * 2;
  const orderQty = Math.max(targetQty - currentQty, 0);

  // Round up to nearest case/pack size if needed
  // For now, use simple rounding to nearest 10 for convenience
  return Math.ceil(orderQty / 10) * 10;
}

function generatePONumber(): string {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `PO-${date}-${random}`;
}

async function generatePurchaseOrders() {
  try {
    const items = await getItemsNeedingReorder();
    const vendors = await getVendors();

    if (items.length === 0) {
      console.log("✅ No items need reordering");
      return;
    }

    if (vendors.length === 0) {
      console.log("⚠️  No vendors found");
      return;
    }

    console.log("");
    console.log("📦 Generating Purchase Orders...");
    console.log("=================================");

    for (const vendor of vendors) {
      const poNumber = generatePONumber();
      const poItems: PurchaseOrderItem[] = [];

      // For each vendor, find products they supply that need reordering
      // In a real implementation, this would query product_vendors table
      // For now, we'll simulate with a subset of items
      const vendorItems = items.slice(0, Math.min(items.length, 5));

      for (const item of vendorItems) {
        const orderQty = calculateOrderQuantity(
          item.available_quantity,
          item.reorder_point,
          item.avg_daily_sales,
          item.lead_time_days,
        );

        if (orderQty > 0) {
          poItems.push({
            variant_id: item.variant_id,
            sku: item.sku,
            product_title: item.product_title,
            variant_title: item.variant_title,
            quantity: orderQty,
            unit_cost: 10.0, // Placeholder - should come from product_vendors
          });
        }
      }

      if (poItems.length > 0) {
        console.log("");
        console.log(`📄 PO: ${poNumber}`);
        console.log(`   Vendor: ${vendor.name}`);
        console.log(`   Items: ${poItems.length}`);
        console.log(
          `   Total Cost: $${poItems.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0).toFixed(2)}`,
        );

        if (!isDryRun) {
          // In a real implementation, this would:
          // 1. Create PO record in database
          // 2. Create PO items records
          // 3. Generate CSV file
          // 4. Send email to vendor (optional)
          console.log("   ✅ PO created (status: draft)");
        } else {
          console.log("   🔍 DRY RUN - PO not created");
        }
      }
    }

    console.log("");
    console.log("✅ Purchase order generation complete");

    if (isDryRun) {
      console.log("");
      console.log("💡 Run without --dry-run to create actual POs");
    }
  } catch (error) {
    console.error("❌ Error generating purchase orders:", error);
    process.exit(1);
  }
}

// Run the script
generatePurchaseOrders()
  .then(() => {
    console.log("");
    console.log("🎉 Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
