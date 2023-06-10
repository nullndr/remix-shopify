import { redirect } from "@remix-run/node";
import * as crypto from "crypto";
import { stateSession } from "./sessions/stateSession.server";

type BeginArgs = {
  clientId: string;
  scopes: string[];
  callbackPath: string;
  isOnline?: boolean;
};

/**
 * Initializate an OAuth request from Shopify.
 *
 * This function will throw a redirect to the authorization url so it never returns.
 */
export async function beginShopifyAuth(
  shop: string,
  { scopes, clientId, callbackPath, isOnline = false }: BeginArgs,
): Promise<never> {
  const session = await stateSession.getSession();
  const state = nonce();
  session.set("state", state);

  const redirectUrl = new URL(`https://${shop}/admin/oauth/authorize`);

  redirectUrl.searchParams.append("client_id", clientId);
  redirectUrl.searchParams.append("scope", scopes.join(","));
  redirectUrl.searchParams.append("redirect_uri", callbackPath);
  redirectUrl.searchParams.append("state", state);
  redirectUrl.searchParams.append(
    "grant_options[]",
    isOnline ? "per-user" : "",
  );

  throw redirect(redirectUrl.toString(), {
    headers: {
      "Set-Cookie": await stateSession.commitSession(session),
    },
  });
}

type CallbackArgs = {
  request: Request;
  clientId: string;
  appSecret: string;
};

type CallbackResult = {
  shopifyDomain: string;
  accessToken: string;
  host: string;
};

/**
 * Validate the request from Shopify sent to `redirectPath` in `initializeShopifyAuth`.
 *
 * Returns the access token on success.
 */
export async function callbackShopifyAuth({
  request,
  clientId,
  appSecret,
}: CallbackArgs): Promise<CallbackResult> {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host");

  if (!code || !shop || !host) {
    throw new Response(null, {
      status: 400,
    });
  }

  const stateFromUrl = url.searchParams.get("state");

  const session = await stateSession.getSession(request.headers.get("Cookie"));
  const stateFromSession = session.get("state");
  stateSession.destroySession(session);

  const isVerifiedRequest = isValidHMAC(request, appSecret);
  const isValidState = stateFromSession === stateFromUrl;

  if (!isVerifiedRequest || !isValidState) {
    throw new Response(null, {
      status: 401,
    });
  }

  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: appSecret,
      code,
    }),
  });

  const payload = await response.json();

  if ("access_token" in payload && typeof payload.access_token === "string") {
    return { shopifyDomain: shop, accessToken: payload.access_token, host };
  }

  throw new Response(null, {
    status: 401,
  });
}

const nonce = () => {
  const length = 15;
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return bytes.map((byte) => byte % 10).join("");
};

const isValidHMAC = (request: Request, secret: string): boolean => {
  const url = new URL(request.url);
  const hmac = url.searchParams.get("hmac");

  if (hmac == null) {
    return false;
  }

  /*
   * In order to check if the 'hmac' parameter is correct,
   * we need to separate the 'hmac' parameter from the others
   */
  url.searchParams.delete("hmac");

  /*
   * The remaining parameters must also be sorted:
   * https://shopify.dev/apps/auth/oauth/getting-started#remove-the-hmac-parameter-from-the-query-string
   */
  url.searchParams.sort();
  const urlParamsWithoutHMAC = url.searchParams.toString();

  const hmacCalculated = crypto
    .createHmac("sha256", secret)
    .update(Buffer.from(urlParamsWithoutHMAC))
    .digest("hex")
    .toLowerCase();

  return hmac === hmacCalculated;
};
