import type { LoaderArgs } from "@remix-run/node";
import { initializeShopifyAuth } from "~/remixShopify.server";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const shopifyDomain = url.searchParams.get("shop");
  const host = request.headers.get("host");

  if (shopifyDomain == null || host == null) {
    throw new Response(null, {
      status: 400,
      statusText: "Invalid request",
    });
  }

  await initializeShopifyAuth({
    shopifyDomain,
    clientId: "my_shopify_api_key",
    scopes: ["read_customers", "write_customers"],
    redirectPath: `https://${host}/api/auth/callback`,
  });
};
