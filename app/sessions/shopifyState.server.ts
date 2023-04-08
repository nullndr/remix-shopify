import { createCookieSessionStorage } from "@remix-run/node";

export const shopifyState = createCookieSessionStorage({
  cookie: {
    name: "shopify state",
    secure: true,
    secrets: ["sup3r_se3cr3t"],
    path: "/",
    httpOnly: true,
    sameSite: "none",
    maxAge: 120, // 2 minutes
  },
});
