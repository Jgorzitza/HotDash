import fs from "node:fs";
const planPath = "reports/manager/plan.json";
if (!fs.existsSync(planPath)) {
  console.error("Missing reports/manager/plan.json"); process.exit(1);
}
const plan = JSON.parse(fs.readFileSync(planPath,"utf8"));
const bad = [];
(plan.agents || []).forEach(a => {
  (a.molecules || []).forEach(m => {
    if (typeof m.ttl_hours !== "number" || m.ttl_hours > 8) bad.push(m.title + ":ttl");
    if (!m.allowed_paths || m.allowed_paths.length === 0) bad.push(m.title + ":paths");
  });
});
if (bad.length) { console.error("Invalid molecules:", bad.join(", ")); process.exit(1); }
console.log("Molecules OK.");
