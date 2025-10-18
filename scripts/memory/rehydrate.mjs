import fs from "node:fs";
import crypto from "node:crypto";
const planPath = "reports/manager/plan.json";
if (!fs.existsSync(planPath)) {
  console.error("Missing reports/manager/plan.json"); process.exit(1);
}
const buf = fs.readFileSync(planPath);
const hash = crypto.createHash("sha256").update(buf).digest("hex");
const plan = JSON.parse(buf.toString("utf8"));
const out = {
  event: "rehydrate",
  plan_sha256: hash,
  next_gates: plan.next_gates || [],
  north_star: plan.north_star || ""
};
console.log(JSON.stringify(out, null, 2));
