import { LoaderArgs } from "@remix-run/node";
import { validateShopifyAuth } from "~/remixShopify.server";

export const loader = async ({ request }: LoaderArgs) => {
  await validateShopifyAuth({
    request,
    clientId: "my_shopify_api_key",
    appSecret: "my_shopify_app_secret",
  });
};
