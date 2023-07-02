import type { LoaderArgs } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { Provider as ShopifyProvider } from "@shopify/app-bridge-react";
import { AppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import { redirect } from "react-router";
import { shopDomainSession } from "~/sessions/shopDomainSession.server";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host");
  const apiKey = process.env.SHOPIFY_API_KEY;

  if (!apiKey) {
    throw new Error("Missing shopify api key");
  }

  if (shop && host) {
    const session = await shopDomainSession.getSession(
      request.headers.get("Cookie"),
    );
    const shopifyDomain = session.get("shopifyDomain");

    if (shopifyDomain === shop) {
      return {
        apiKey,
        host,
      };
    }

    throw redirect(`/api/auth?shop=${shop}&host=${host}`);
  }

  throw new Error("Missing shop or host parameters");
};

export default function Provider() {
  const { apiKey, host } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AppProvider i18n={en}>
      <ShopifyProvider
        config={{
          apiKey,
          host,
          forceRedirect: true,
        }}
        router={{
          location,
          history: {
            replace: (path) => navigate(path),
          },
        }}
      >
        <Outlet />
      </ShopifyProvider>
    </AppProvider>
  );
}
