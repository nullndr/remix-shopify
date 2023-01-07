import { createCookieSessionStorage } from "@remix-run/node";

export const shopifyState = createCookieSessionStorage({
  cookie: {
    name: "shopify state",
    secure: process.env.NODE_ENV !== "development",
    secrets: ["sup3r_se3cr3t"],
    path: "/",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? false : "lax",
    maxAge: 600, // 10 minutes
  },
});
