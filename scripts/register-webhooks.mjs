/**
 * `node scripts/register-webhooks.mjs [--website=https://your-site.com]`
 * `node scripts/register-webhooks.mjs [--url=https://your-site.com]`
 *
 * Lists existing webhook subscriptions, then prunes stale ones and creates
 * any missing required topics. Idempotent — an already-registered topic is
 * left alone.
 *
 * Ported from the crawlandcuddle reference (scripts/register-webhooks.ts),
 * scoped to the order purchase event: `ORDERS_PAID` is the "a purchase really
 * happened" signal this site needs — it drives the server-side purchase
 * analytics in app/api/webhooks/shopify-order-paid/route.ts (Meta CAPI +
 * GA4 Measurement Protocol), because the shopper pays on Shopify's hosted
 * checkout and never returns to a client-side success page here.
 *
 * The Admin access token is generated at runtime via the client-credentials
 * grant (Client ID + Secret → 24h token) — never passed in directly.
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/* ── minimal .env loader ───────────────────────────────────────────────── */
function loadEnv() {
  const result = {};
  const path = join(ROOT, ".env");
  if (!existsSync(path)) return result;
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

const env = loadEnv();
for (const [key, value] of Object.entries(env)) {
  if (process.env[key] === undefined && value !== undefined)
    process.env[key] = value;
}

const cfg = {
  storeDomain: (process.env.SHOPIFY_STORE_DOMAIN ?? "")
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, ""),
  apiVersion: process.env.SHOPIFY_API_VERSION || "2026-07",
  adminClientId: process.env.SHOPIFY_ADMIN_CLIENT_ID || null,
  adminClientSecret: process.env.SHOPIFY_ADMIN_CLIENT_SECRET || null,
  adminToken: process.env.SHOPIFY_ADMIN_API_TOKEN || null,
};

if (!cfg.storeDomain) {
  console.error(
    "✖ SHOPIFY_STORE_DOMAIN is not set (e.g. your-store.myshopify.com)",
  );
  process.exit(1);
}
if (!cfg.adminToken && !(cfg.adminClientId && cfg.adminClientSecret)) {
  console.error(
    "✖ Admin API is not configured. Set SHOPIFY_ADMIN_CLIENT_ID + SHOPIFY_ADMIN_CLIENT_SECRET in .env (or a legacy SHOPIFY_ADMIN_API_TOKEN).",
  );
  process.exit(1);
}

let cachedToken = null;
async function getAdminToken() {
  if (cfg.adminToken) return cfg.adminToken;
  if (cachedToken) return cachedToken;
  const res = await fetch(
    `https://${cfg.storeDomain}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: cfg.adminClientId,
        client_secret: cfg.adminClientSecret,
      }),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description ||
        data.error ||
        `token request failed (HTTP ${res.status})`,
    );
  }
  cachedToken = data.access_token;
  return cachedToken;
}

const endpoint = `https://${cfg.storeDomain}/admin/api/${cfg.apiVersion}/graphql.json`;

async function adminRequest(query, variables = {}) {
  const token = await getAdminToken();
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.errors?.length) {
    throw new Error(body.errors?.[0]?.message || `HTTP ${res.status}`);
  }
  return body.data;
}

/* ── Admin GraphQL (webhook subscriptions) ─────────────────────────────── */

const WEBHOOK_SUBSCRIPTIONS_QUERY = /* GraphQL */ `
  query WebhookSubscriptions {
    webhookSubscriptions(first: 100) {
      nodes {
        id
        topic
        endpoint {
          __typename
          ... on WebhookHttpEndpoint {
            callbackUrl
          }
        }
      }
    }
  }
`;

const WEBHOOK_SUBSCRIPTION_CREATE_MUTATION = /* GraphQL */ `
  mutation WebhookCreate(
    $topic: WebhookSubscriptionTopic!
    $callbackUrl: URL!
  ) {
    webhookSubscriptionCreate(
      topic: $topic
      webhookSubscription: { callbackUrl: $callbackUrl, format: JSON }
    ) {
      webhookSubscription {
        id
        topic
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const WEBHOOK_SUBSCRIPTION_DELETE_MUTATION = /* GraphQL */ `
  mutation WebhookDelete($id: ID!) {
    webhookSubscriptionDelete(id: $id) {
      deletedWebhookSubscriptionId
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * The order purchase event. `ORDERS_PAID` fires when payment clears, which is
 * exactly the conversion signal the /api/webhooks/shopify-order-paid handler
 * forwards to Meta Conversions API and GA4 Measurement Protocol.
 */
const REQUIRED_TOPICS = ["ORDERS_PAID"];

async function main() {
  // Site URL comes from `--website https://…` (space or `=`), `--url=…`, or
  // NEXT_PUBLIC_SITE_URL — in that order.
  const urlEquals =
    process.argv
      .find((arg) => arg.startsWith("--url="))
      ?.slice("--url=".length) ??
    process.argv
      .find((arg) => arg.startsWith("--website="))
      ?.slice("--website=".length);
  const websiteIndex = process.argv.indexOf("--website");
  const websiteValue =
    websiteIndex !== -1 ? process.argv[websiteIndex + 1] : null;
  const siteUrl = (
    urlEquals ??
    websiteValue ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    ""
  ).replace(/\/+$/, "");

  if (!siteUrl) {
    console.error(
      "✖ No site URL. Pass one or set NEXT_PUBLIC_SITE_URL:\n" +
        "  npm run shopify:webhooks -- --website https://your-site.com\n" +
        "  npm run shopify:webhooks -- --url=https://your-site.com",
    );
    process.exit(1);
  }
  if (siteUrl.startsWith("http://localhost")) {
    console.warn(
      "⚠ Shopify cannot deliver webhooks to localhost. Pass a public URL:\n" +
        "  npm run shopify:webhooks -- --website https://your-tunnel.example.com",
    );
  }

  const callbackUrl = `${siteUrl}/api/webhooks/shopify-order-paid`;
  console.log(`\nWebhook subscriptions → ${callbackUrl}\n`);

  const existing = await adminRequest(WEBHOOK_SUBSCRIPTIONS_QUERY);
  const allNodes = existing?.webhookSubscriptions?.nodes ?? [];

  // List everything currently registered so you can see what's there.
  if (allNodes.length === 0) {
    console.log("  (no webhooks registered)");
  } else {
    for (const node of allNodes) {
      console.log(`  • ${node.topic}  →  ${node.endpoint?.callbackUrl ?? "?"}`);
    }
  }
  console.log(
    `  ${allNodes.length} subscription(s) currently registered on this store\n`,
  );

  // Prune stale subscriptions for our topics — anything pointing at a
  // different callback (e.g. an old ngrok tunnel) is deleted, so re-pointing
  // the webhook to a new domain is a clean single-run move.
  let deleted = 0;
  for (const node of allNodes) {
    if (!REQUIRED_TOPICS.includes(node.topic)) continue;
    if (node.endpoint?.callbackUrl === callbackUrl) continue;

    const result = await adminRequest(WEBHOOK_SUBSCRIPTION_DELETE_MUTATION, {
      id: node.id,
    });
    const errors = result?.webhookSubscriptionDelete?.userErrors ?? [];
    if (errors.length > 0) {
      console.log(
        `  error    delete ${node.topic}: ${errors.map((e) => e.message).join("; ")}`,
      );
      continue;
    }
    console.log(`  deleted  ${node.topic} → ${node.endpoint?.callbackUrl}`);
    deleted += 1;
  }

  const registered = new Set(
    allNodes
      .filter(
        (node) =>
          REQUIRED_TOPICS.includes(node.topic) &&
          node.endpoint?.callbackUrl === callbackUrl,
      )
      .map((node) => node.topic),
  );

  let created = 0;
  for (const topic of REQUIRED_TOPICS) {
    if (registered.has(topic)) {
      console.log(`  skip     ${topic} (already registered)`);
      continue;
    }

    const result = await adminRequest(WEBHOOK_SUBSCRIPTION_CREATE_MUTATION, {
      topic,
      callbackUrl,
    });

    const errors = result?.webhookSubscriptionCreate?.userErrors ?? [];
    if (errors.length > 0) {
      console.log(
        `  error    ${topic}: ${errors.map((e) => e.message).join("; ")}`,
      );
      continue;
    }
    console.log(`  created  ${topic}`);
    created += 1;
  }

  console.log(
    `\n${created} subscription(s) created, ${deleted} stale deleted, ${REQUIRED_TOPICS.length - created} already present.`,
  );
  console.log(
    "Remember: the signing secret must match SHOPIFY_WEBHOOK_SECRET in .env",
  );
}

main().catch((error) => {
  console.error("✖", error instanceof Error ? error.message : error);
  process.exit(1);
});
