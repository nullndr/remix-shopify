import { Card, Page } from "@shopify/polaris";

export default function Index() {
  return (
    <Page title="Remix Shopify">
      <Card title="Welcome to Remix">
        <Card.Section>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </Card.Section>
        <Card.Section>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </Card.Section>
        <Card.Section>
          <a
            target="_blank"
            href="https://polaris.shopify.com/components"
            rel="noreferrer"
          >
            Polaris Components
          </a>
        </Card.Section>
        <Card.Section>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </Card.Section>
      </Card>
    </Page>
  );
}
