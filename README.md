# Remix Shopify App

All in one Remix.run template to get started with Shopify App's.

Learn more about [Remix Stacks](https://remix.run/stacks).

```
npx create-remix@latest --template nullndr/remix-shopify
```

## What's in the stack

- Shopify [Polaris](https://polaris.shopify.com) react library
- OAuth 2.0 [authorization flow](https://shopify.dev/apps/auth/oauth#the-oauth-flow) to issue access tokens on users
- Code formatting with [Prettier](https://prettier.io)
- Linting with [ESLint](https://eslint.org)
- Static Types with [TypeScript](https://typescriptlang.org)

## Docker

The [`docker-compose.yaml`](./docker-compose.yaml) file starts an ngrok container.

For this you need to get an ngrok auth token and set it in your `.env` file (you can use the `.env.example` file as example).

The `NGROK_SUBDOMAIN` is your subdomain for the `ngrok.io` domain, for example if you set `NGROK_SUBDOMAIN=myfoobar` your app will be accessible at `myfoobar.ngrok.io`.

## Development

1. Write your `SHOPIFY_API_KEY` and your `SHOPIFY_API_SECRET` in the `.env` file (you can use the `.env.example` file as example).

2. Replace the `scopes` value in [`app/routes/api/auth`](./app/routes/api/auth_.ts) with the permissions your app needs.

3. Run the first build:
    ```sh
    npm run build
    ```

4. Start dev server:
    ```
    npm run dev
    ```

### Type Checking

This project uses TypeScript. It's recommended to get TypeScript set up for your editor to get a really great in-editor experience with type checking and auto-complete. To run type checking across the whole project, run `npm run typecheck`.

### Linting

This project uses ESLint for linting. That is configured in `.eslintrc.js`.

### Formatting

We use [Prettier](https://prettier.io/) for auto-formatting in this project. It's recommended to install an editor plugin (like the [VSCode Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)) to get auto-formatting on save. There's also a `npm run format` script you can run to format all files in the project.