import { createCookieSessionStorage } from "@remix-run/node";

type SessionData = {
  state: string;
};

export const stateSession = createCookieSessionStorage<SessionData>({
  cookie: {
    name: "shopify_app_state",
    secure: true,
    secrets: ["sup3r_se3cr3t"],
    path: "/",
    httpOnly: true,
    sameSite: "none",
    maxAge: 120, // 2 minutes
  },
});
