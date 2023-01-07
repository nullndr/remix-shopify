import { redirect } from "@remix-run/node";
import * as crypto from "crypto";
import { shopifyState } from "./shopifyState.server";

type BeginShopifyAuthArgs = {
  shopifyDomain: string;
  scopes: string[];
  redirectPath: string;
  clientId: string;
};

/**
 * Initializate a OAuth request from Shopify.
 *
 * This function will throw a redirect to the authorization url so it never returns.
 */
export async function initializeShopifyAuth({
  shopifyDomain,
  scopes,
  clientId,
  redirectPath,
}: BeginShopifyAuthArgs): Promise<never> {
  const session = await shopifyState.getSession();
  const state = generateState();
  session.set("state", state);

  const authorizeUrl = new URL(`${shopifyDomain}/admin/oauth/authorize`);

  authorizeUrl.searchParams.append("client_id", clientId);
  authorizeUrl.searchParams.append("scope", scopes.join(","));
  authorizeUrl.searchParams.append("redirect_uri", redirectPath);
  authorizeUrl.searchParams.append("state", state);

  throw redirect(authorizeUrl.toString(), {
    headers: {
      "Set-Cookie": await shopifyState.commitSession(session),
    },
  });
}

type ValidateAuthCallbackArgs = {
  request: Request;
  clientId: string;
  appSecret: string;
};

type AuthCallbackResult =
  | {
      success: true;
      shopifyDomain: string;
      accessToken: string;
    }
  | {
      success: false;
    };

/**
 * Validate the request from Shopify sent to `redirectPath` in `initializeShopifyAuth`.
 *
 * Returns the access token on success.
 */
export async function validateShopifyAuth({
  request,
  clientId,
  appSecret,
}: ValidateAuthCallbackArgs): Promise<AuthCallbackResult> {
  const validationResult = await validateShopifyRequest({
    request,
    appSecret,
  });

  if (validationResult.success) {
    const { code, shopifyDomain } = validationResult;

    const body = JSON.stringify({
      client_id: clientId,
      client_secret: appSecret,
      code,
    });

    const response = await fetch(
      `https://${shopifyDomain}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      }
    );

    const payload = await response.json();

    if ("access_token" in payload && typeof payload.access_token === "string") {
      return {
        success: true,
        shopifyDomain,
        accessToken: payload.access_token,
      };
    }
  }

  return {
    success: false,
  };
}

type ValidateRequestArgs = {
  request: Request;
  appSecret: string;
};

type ValidateShopifyRequestResult =
  | {
      success: true;
      code: string;
      shopifyDomain: string;
    }
  | {
      success: false;
    };

const validateShopifyRequest = async ({
  request,
  appSecret,
}: ValidateRequestArgs): Promise<ValidateShopifyRequestResult> => {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const shopifyDomain = url.searchParams.get("shop");
  const host = url.searchParams.get("host");

  if (!code || !shopifyDomain || !host) {
    return {
      success: false,
    };
  }

  const stateFromUrl = url.searchParams.get("state");

  const session = await shopifyState.getSession(request.headers.get("Cookie"));
  const stateFromSession = session.get("state");
  shopifyState.destroySession(session);

  const isVerifiedRequest = isHMACValid(request, appSecret);
  const isValidState = stateFromSession === stateFromUrl;

  if (!isVerifiedRequest || !isValidState) {
    return {
      success: false,
    };
  }

  return {
    success: true,
    code,
    shopifyDomain,
  };
};

const generateState = () => {
  return Math.random()
    .toString(16)
    .substring(2, Math.floor(Math.random() * (32 - 16) + 16));
};

const isHMACValid = (request: Request, secret: string): boolean => {
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
  const urlParamsWithoutHMAC = url.searchParams.toString();

  const hmacCalculated = crypto
    .createHmac("sha256", secret)
    .update(Buffer.from(urlParamsWithoutHMAC))
    .digest("hex")
    .toLowerCase();

  return hmac === hmacCalculated;
};
