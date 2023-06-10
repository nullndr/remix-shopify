import { createCookieSessionStorage } from "@remix-run/node";

type SessionData = {
  shopifyDomain: string;
};

export const shopDomainSession = createCookieSessionStorage<SessionData>({
  cookie: {
    name: "shopify_app_domain",
    secure: true,
    sameSite: "none",
    secrets: ["sup3r_s3cr3t"],
    path: "/",
    httpOnly: true,
    maxAge: 86400, // 1 day
  },
});
