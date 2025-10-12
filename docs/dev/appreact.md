---
title: Interacting with Shopify Admin
description: |-
  Learn how to authenticate and handle requests from Shopify Admin in your React Router app.

  The [`authenticate.admin`](/docs/api/shopify-app-react-router/authenticate/admin) function handles authentication for embedded apps and merchant custom apps. It verifies app installation and provides context for interacting with the Admin API.

  This guide covers authentication patterns, API usage, and request handling for your app.
api_version: v1 latest
api_name: shopify-app-react-router
source_url:
  html: https://shopify.dev/docs/api/shopify-app-react-router/latest/guide-admin
  md: https://shopify.dev/docs/api/shopify-app-react-router/latest/guide-admin.md
---

# Interacting with Shopify Admin

Learn how to authenticate and handle requests from Shopify Admin in your React Router app.

The [`authenticate.admin`](https://shopify.dev/docs/api/shopify-app-react-router/authenticate/admin) function handles authentication for embedded apps and merchant custom apps. It verifies app installation and provides context for interacting with the Admin API.

This guide covers authentication patterns, API usage, and request handling for your app.

***

## Authenticating requests

To authenticate admin requests you can call `authenticate.admin(request)` in a loader or an action.

If there's a session for this user, then this loader will return null. If there's no session for the user, then the package will perform [token exchange](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/#token-exchange) and create a new session.

Tip

If you are authenticating more than one route, then we recommend using [React router layout routes](https://reactrouter.com/start/framework/routing#layout-routes) to automatically authenticate them.

### Examples

* #### Authenticating requests

  ##### /app/routes/\*\*/\*.tsx

  ```tsx
  import {LoaderFunction, ActionFunction} from 'react-router';

  import {authenticate} from '~/shopify.server';

  export const loader: LoaderFunction = async ({request}) => {
    await authenticate.admin(request);

    // App logic

    return null;
  };

  export const action: ActionFunction = async ({request}) => {
    await authenticate.admin(request);

    // App logic

    return null;
  };
  ```

## Headers

When redirecting outside the app, and in certain error scenarios, the package will throw a response with specific headers.

To ensure the headers are set correctly use the provided `ErrorBoundary` and `headers` exports.

### Examples

* #### Configure headers and error boundaries

  ##### /app/routes/\*\*/\*.tsx

  ```tsx
  import {useRouteError} from 'react-router';
  import {boundary} from '@shopify/shopify-app-react-router';

  export function ErrorBoundary() {
    return boundary.error(useRouteError());
  }

  export const headers = (headersArgs) => {
    return boundary.headers(headersArgs);
  };
  ```

## Using the GraphQL API

Once a request is authenticated, `authenticate.admin` will return an `admin` object that contains a GraphQL client that can interact with the [GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql).

[![](https://shopify.dev/images/icons/32/tutorial.png)![](https://shopify.dev/images/icons/32/tutorial-dark.png)](https://shopify.dev/docs/api/shopify-app-react-router/guide-graphql-types)

[Typing GraphQL operations](https://shopify.dev/docs/api/shopify-app-react-router/guide-graphql-types)

### Examples

* #### Make GraphQL requests

  ##### /app/routes/\*\*/\*.tsx

  ```tsx
  import {ActionFunction} from 'react-router';

  import {authenticate} from '../shopify.server';

  export const action: ActionFunction = async ({request}) => {
    const {admin} = await authenticate.admin(request);

    const response = await admin.graphql(
      `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
          }
        }
      }`,
      {
        variables: {
          input: {
            title: 'New product',
            variants: [{price: 100}],
          },
        },
      },
    );
    const parsedResponse = await response.json();

    return {data: parsedResponse.data};
  };
  ```

## Authenticating cross-origin admin requests

If your React Router server is authenticating an admin extension, then a request from the extension to the server will be cross-origin.

Here `authenticate.admin` provides a `cors` function to add the required cross-origin headers.

### Examples

* #### Add cross-origin headers

  ##### /app/routes/\*\*/\*.tsx

  ```tsx
  import {LoaderFunction} from 'react-router';

  import {authenticate} from '~/shopify.server';

  export const loader: LoaderFunction = async ({request}) => {
    const {cors} = await authenticate.admin(request);

    // App logic

    return cors({my: 'data'});
  };
  ```

## Using the GraphQL API in background jobs

You may need to interact with the Admin API when working outside of Shopify requests. To do so use the `unauthenticated.admin` function.

This enables apps to integrate with 3rd party services and perform background tasks.

Caution

This function doesn't perform **any** validation and shouldn't rely on raw user input.

When using this function, consider the following:

#### Background tasks

Apps should ensure that the shop domain is authenticated when enqueueing jobs.

#### 3rd party service requests

Apps must obtain the shop domain from the 3rd party service in a secure way.

[![](https://shopify.dev/images/icons/32/tutorial.png)![](https://shopify.dev/images/icons/32/tutorial-dark.png)](https://shopify.dev/docs/api/shopify-app-react-router/unauthenticated/unauthenticated-admin)

[Unauthenticated Admin](https://shopify.dev/docs/api/shopify-app-react-router/unauthenticated/unauthenticated-admin)

### Examples

* #### Make GraphQL requests in background jobs

  ##### /app/jobs/\*\*/\*.tsx

  ```tsx
  // /background-jobs/**/*.ts
  import { unauthenticated } from "../shopify.server";

  // Background job set up

  const shop = 'mystore.myshopify.com'
  const { admin } = await unauthenticated.admin(shop);

  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
          }
        }
      }
    `,
    { variables: { input: { title: "Product Name" } } }
  );

  const productData = await response.json();

  // Background job complete
  ```

## Resources

[![](https://shopify.dev/images/icons/32/pickaxe-1.png)![](https://shopify.dev/images/icons/32/pickaxe-1-dark.png)](https://shopify.dev/docs/api/shopify-app-react-router/authenticate/admin)

[authenticate.admin](https://shopify.dev/docs/api/shopify-app-react-router/authenticate/admin)
