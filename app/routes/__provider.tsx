import { Outlet } from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";

export default function Provider() {
  return (
    <AppProvider i18n={en}>
      <Outlet />
    </AppProvider>
  );
}
