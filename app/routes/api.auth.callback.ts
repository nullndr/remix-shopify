import { LoaderArgs } from "@remix-run/node";
import { redirect } from "react-router";
import { validateShopifyAuth } from "~/remixShopify.server";
import { shopifyState } from "~/sessions/shopifyState.server";

export const loader = async ({ request }: LoaderArgs) => {
  const data = await validateShopifyAuth({
    request,
    clientId: "my_shopify_api_key",
    appSecret: "my_shopify_app_secret",
  });

  if (data.success) {
    const { host, shopifyDomain } = data;
    const session = await shopifyState.getSession();
    session.set("shopifyDomain", shopifyDomain);
    throw redirect(`/shop=${shopifyDomain}&host=${host}`, {
      headers: {
        "Set-Cookie": await shopifyState.commitSession(session),
      },
    });
  }

  throw new Response(null, {
    status: 401,
    statusText: "Invalid Request",
  });
};
