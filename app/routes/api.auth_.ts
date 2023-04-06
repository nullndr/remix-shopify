import type { LoaderArgs } from "@remix-run/node";
import { initializeShopifyAuth } from "~/remixShopify.server";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const shopifyDomain = url.searchParams.get("shop");
  const host = request.headers.get("host");
  const clientId = process.env.SHOPIFY_API_KEY;

  if (shopifyDomain == null || host == null) {
    throw new Response(null, { status: 400, statusText: "Invalid request" });
  }

  if (clientId == null) {
    throw new Response(null, { status: 500 });
  }

  await initializeShopifyAuth({
    shopifyDomain,
    clientId,
    scopes: ["read_customers", "write_customers"],
    redirectPath: `https://${host}/api/auth/callback`,
  });
};
