import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "react-router";
import { callbackShopifyAuth } from "~/remixShopify.server";
import { shopDomainSession } from "~/sessions/shopDomainSession.server";

export const loader = async ({ request }: LoaderArgs) => {
  const clientId = process.env.SHOPIFY_API_KEY;
  const appSecret = process.env.SHOPIFY_API_SECRET;

  if (clientId == null || appSecret == null) {
    throw new Response(null, { status: 500 });
  }

  const { accessToken, host, shopifyDomain } = await callbackShopifyAuth({
    request,
    clientId,
    appSecret,
  });

  const session = await shopDomainSession.getSession();
  session.set("shopifyDomain", shopifyDomain);
  throw redirect(`/?shop=${shopifyDomain}&host=${host}`, {
    headers: {
      "Set-Cookie": await shopDomainSession.commitSession(session),
    },
  });
};
