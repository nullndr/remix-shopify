import { LoaderArgs } from "@remix-run/node";
import { redirect } from "react-router";
import { validateShopifyAuth } from "~/remixShopify.server";
import { shopifyState } from "~/sessions/shopifyState.server";

export const loader = async ({ request }: LoaderArgs) => {
  const clientId = process.env.SHOPIFY_API_KEY;
  const appSecret = process.env.SHOPIFY_API_SECRET;

  if (clientId == null || appSecret == null) {
    throw new Response(null, { status: 500 });
  }

  const data = await validateShopifyAuth({
    request,
    clientId,
    appSecret,
  });

  if (data.success) {
    const { host, shopifyDomain } = data;
    const session = await shopifyState.getSession();
    session.set("shopifyDomain", shopifyDomain);
    throw redirect(`/?shop=${shopifyDomain}&host=${host}`, {
      headers: {
        "Set-Cookie": await shopifyState.commitSession(session),
      },
    });
  }

  throw new Response(null, {
    status: 401,
  });
};
