import type { LoaderArgs } from "@remix-run/node";
import { beginShopifyAuth } from "~/remixShopify.server";

export const loader = async ({ request }: LoaderArgs) => {
  const hostName = request.headers.get("host");

  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host");

  if (shop == null || host == null) {
    throw new Response(null, {
      status: 400,
    });
  }

  const clientId = process.env.SHOPIFY_API_KEY;

  if (clientId == null) {
    throw new Error("Missing app client id");
  }

  await beginShopifyAuth(shop, {
    clientId,
    scopes: [
      "read_customers",
      "write_customers",
      "read_orders",
      "read_fulfillments",
    ],
    callbackPath: `https://${hostName}/auth/callback`,
  });
};
