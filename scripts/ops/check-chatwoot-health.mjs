#!/usr/bin/env node
import fs from "node:fs";
import https from "node:https";
import http from "node:http";

const overrideDate = process.env.CHATWOOT_HEALTH_DATE?.trim();
const dateIsValid = overrideDate && /^\d{4}-\d{2}-\d{2}$/.test(overrideDate);
const DATE = dateIsValid ? overrideDate : new Date().toISOString().slice(0, 10);
const outDir = `artifacts/integrations/${DATE}`;
fs.mkdirSync(outDir, { recursive: true });
const outFile = `${outDir}/chatwoot_health.jsonl`;

function log(event) {
  fs.appendFileSync(
    outFile,
    JSON.stringify({ ts: new Date().toISOString(), ...event }) + "\n",
  );
}

function fetchUrl(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.request(url, opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () =>
        resolve({ status: res.statusCode, headers: res.headers, body: data }),
      );
    });
    req.on("error", reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

function loadEnvValues() {
  const candidates = [
    process.env.CHATWOOT_ENV_FILE,
    process.env.CHATWOOT_API_TOKEN_FILE,
    process.env.CHATWOOT_ACCOUNT_FILE,
    "vault/occ/chatwoot/base_url_staging.env",
    "vault/occ/chatwoot/api_token_staging.env",
    "vault/occ/chatwoot/account_id_staging.env",
  ]
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index);

  const values = {};
  for (const file of candidates) {
    try {
      if (!fs.existsSync(file)) continue;
      const content = fs.readFileSync(file, "utf8");
      for (const line of content.split(/\r?\n/)) {
        if (!line || line.startsWith("#") || !line.includes("=")) continue;
        const [key, ...rest] = line.split("=");
        if (!key) continue;
        const value = rest.join("=");
        if (!value) continue;
        const trimmedKey = key.trim();
        if (!trimmedKey || trimmedKey in values) continue;
        values[trimmedKey] = value.trim();
      }
    } catch (err) {
      log({
        level: "warn",
        msg: "env_file_read_failed",
        file,
        error: String((err && err.message) || err),
      });
    }
  }

  return values;
}

async function main() {
  const envValues = loadEnvValues();
  const base = process.env.CHATWOOT_BASE_URL || envValues.CHATWOOT_BASE_URL;
  const token =
    process.env.CHATWOOT_API_TOKEN ||
    process.env.CHATWOOT_API_TOKEN_STAGING ||
    envValues.CHATWOOT_API_TOKEN ||
    envValues.CHATWOOT_API_TOKEN_STAGING;
  const accountId =
    process.env.CHATWOOT_ACCOUNT_ID ||
    process.env.CHATWOOT_ACCOUNT_ID_STAGING ||
    process.env.CHATWOOT_ACCOUNT_ID_PROD ||
    envValues.CHATWOOT_ACCOUNT_ID ||
    envValues.CHATWOOT_ACCOUNT_ID_STAGING;
  const tokenHeader = (
    process.env.CHATWOOT_TOKEN_HEADER ||
    envValues.CHATWOOT_TOKEN_HEADER ||
    "api_access_token"
  ).trim();
  const healthPathsRaw =
    process.env.CHATWOOT_HEALTH_PATH ||
    process.env.CHATWOOT_HEALTH_PATHS ||
    envValues.CHATWOOT_HEALTH_PATH ||
    envValues.CHATWOOT_HEALTH_PATHS ||
    "/rails/health,/api";

  if (!base) {
    log({ level: "error", msg: "CHATWOOT_BASE_URL not set" });
    process.exit(1);
  }
  try {
    const normalizedBase = base.replace(/\/$/, "");
    if (overrideDate && !dateIsValid) {
      log({
        level: "warn",
        msg: "invalid_chatwoot_health_date",
        provided: overrideDate,
      });
    }
    const healthPaths = healthPathsRaw
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => (p.startsWith("/") ? p : `/${p}`));

    let healthOk = false;
    let lastHealthStatus;
    let lastHealthPath;

    for (const path of healthPaths) {
      const health = await fetchUrl(`${normalizedBase}${path}`);
      lastHealthStatus = health.status;
      lastHealthPath = path;
      log({ level: "info", step: "health_probe", path, status: health.status });
      if (health.status && health.status >= 200 && health.status < 300) {
        healthOk = true;
        break;
      }
    }

    if (!healthOk) {
      log({
        level: "error",
        msg: "health_probe_failed",
        status: lastHealthStatus ?? "unknown",
        path: lastHealthPath,
      });
    }

    let authedOk = true;
    if (token) {
      const headers = {};
      if (tokenHeader.toLowerCase() === "authorization") {
        headers.Authorization = /^bearer\s/i.test(token)
          ? token
          : `Bearer ${token}`;
      } else {
        headers[tokenHeader] = token;
      }

      const authedPath = accountId
        ? `/api/v1/accounts/${accountId}`
        : "/api/v1/accounts";

      const authed = await fetchUrl(`${normalizedBase}${authedPath}`, {
        headers,
      });
      log({
        level: "info",
        step: "authed_probe",
        status: authed.status,
        path: authedPath,
      });
      authedOk = authed.status && authed.status >= 200 && authed.status < 400;
    } else {
      log({
        level: "warn",
        msg: "No CHATWOOT_API_TOKEN provided; skipping authed probe",
      });
    }

    if (!healthOk || !authedOk) process.exit(2);
    process.exit(0);
  } catch (e) {
    log({
      level: "error",
      msg: "probe_failed",
      error: String((e && e.message) || e),
    });
    process.exit(2);
  }
}

await main();
