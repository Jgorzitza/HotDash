#!/usr/bin/env node
import process from "node:process";

import { config as loadEnv } from "dotenv";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  loadEnv();
}

const requiredEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY"];
const missing = requiredEnv.filter((name) => !process.env[name]);

if (missing.length === 0) {
  console.log("Supabase credentials detected. Memory persistence enabled.");
  process.exit(0);
}

// In CI we fail if credentials are missing; local fallback still works outside CI.
console.error(
  `Missing Supabase configuration: ${missing.join(", ")}. Set secrets to ensure decisions/facts persist.`,
);
process.exit(1);
