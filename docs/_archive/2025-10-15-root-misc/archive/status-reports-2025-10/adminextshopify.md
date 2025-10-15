---
title: Admin UI extensions
description: Admin UI extensions make it possible to surface contextual app functionality within the Shopify Admin interface.
api_version: 2025-10
api_name: admin-extensions
source_url:
  html: https://shopify.dev/docs/api/admin-extensions
  md: https://shopify.dev/docs/api/admin-extensions.md
---

# Admin UI extensions

Admin UI extensions make it possible to surface contextual app functionality within the Shopify Admin interface.

## Overview

Extend the Shopify Admin with UI Extensions.

[![](https://shopify.dev/images/icons/32/tutorial.png)![](https://shopify.dev/images/icons/32/tutorial-dark.png)](https://shopify.dev/docs/apps/admin/admin-actions-and-blocks/build-an-admin-action)

[TutorialGet started building your first admin extension](https://shopify.dev/docs/apps/admin/admin-actions-and-blocks/build-an-admin-action)

[![](https://shopify.dev/images/icons/32/blocks.png)![](https://shopify.dev/images/icons/32/blocks-dark.png)](https://shopify.dev/docs/api/admin-extensions/components)

[Component APIsSee all available components](https://shopify.dev/docs/api/admin-extensions/components)

[![](https://shopify.dev/images/icons/32/app.png)![](https://shopify.dev/images/icons/32/app-dark.png)](https://shopify.dev/docs/api/admin-extensions/2025-10-rc/extension-targets)

[ReferenceView a list of available extension targets](https://shopify.dev/docs/api/admin-extensions/2025-10-rc/extension-targets)

[![](https://shopify.dev/images/icons/32/globe.png)![](https://shopify.dev/images/icons/32/globe-dark.png)](https://shopify.dev/docs/api/admin-extensions/2025-10-rc/network-features)

[Network FeaturesLearn about the network features available to admin extensions](https://shopify.dev/docs/api/admin-extensions/2025-10-rc/network-features)

[![](https://shopify.dev/images/icons/32/pickaxe-1.png)![](https://shopify.dev/images/icons/32/pickaxe-1-dark.png)](https://shopify.dev/docs/api/#using-forms)

[Using FormsUse the Form component to integrate with the contextual save bar of the resource page](https://shopify.dev/docs/api/#using-forms)

[![](https://shopify.dev/images/icons/32/pickaxe-1.png)![](https://shopify.dev/images/icons/32/pickaxe-1-dark.png)](https://shopify.dev/docs/api/#picking-resources)

[Picking resourcesPrompt the user to select resources](https://shopify.dev/docs/api/#picking-resources)

[![](https://shopify.dev/images/icons/32/pickaxe-1.png)![](https://shopify.dev/images/icons/32/pickaxe-1-dark.png)](https://www.figma.com/community/file/1554895871000783188/polaris-ui-kit-community)

[Figma kitUse the Figma kit to design your extension](https://www.figma.com/community/file/1554895871000783188/polaris-ui-kit-community)

![](https://shopify.dev/images/templated-apis-screenshots/admin-extensions/2025-10/action-extension-example.gif)

## Getting Started

Use the [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) to [generate a new extension](https://shopify.dev/apps/tools/cli/commands#generate-extension) within your app.

If you already have a Shopify app, you can skip right to the last command shown here.

Make sure you’re using Shopify CLI `v3.85.3` or higher. You can check your version by running `shopify version`.

### Examples

* #### Generate an extension

  ##### CLI

  ```bash
  # create an app if you don't already have one:
  shopify app init --name my-app

  # navigate to your app's root directory:
  cd my-app

  # generate a new extension:
  shopify app generate extension
  # follow the steps to create a new
  # extension in ./extensions.
  ```

## Optional ESLint configuration

If your app is using ESLint, update your configuration to include the new global `shopify` object.

### Examples

* #### .eslintrc.cjs

  ##### Default

  ```js
  module.exports = {
    globals: {
      shopify: 'readonly',
    },
  };
  ```

## Scaffolded with Preact

UI Extensions are scaffolded with [Preact](https://preactjs.com/) by default.

This means that you can use Preact patterns and principles within your extension. Since Preact is included as a standard dependency, you have access to all of its features including [hooks](https://preactjs.com/guide/v10/hooks/) like `useState` and `useEffect` for managing component state and side effects.

You can also use [Preact Signals](https://preactjs.com/guide/v10/signals) for reactive state management, and take advantage of standard web APIs just like you would in a regular Preact application.

### Examples

* #### Scaffolded with Preact

  ##### JSX

  ```jsx
  import '@shopify/ui-extensions/preact';
  import {render} from 'preact';
  import {useState} from 'preact/hooks';

  export default async () => {
    render(<Extension />, document.body);
  }

  function Extension() {
    const [count, setCount] = useState(0);

    return (
      <>
        <s-text>Count: {count}</s-text>
        <s-button onClick={() => setCount(count + 1)}>
          Increment
        </s-button>
      </>
    );
  }
  ```

## Handling events

Handling events in UI extensions are the same as you would handle them in a web app. You can use the `addEventListener` method to listen for events on the components or use the `on[event]` property to listen for events from the components.

When using Preact, event handlers can be registered by passing props beginning with `on`, and the event handler name is case-insensitive. For example, the JSX `<s-button onClick={fn}>` registers `fn` as a "click" event listener on the button.

### Examples

* #### Handling events

  ##### JSX

  ```jsx
  export default function HandlingEvents() {
    const handleClick = () => {
      console.log('s-button clicked');
    };

    return <s-button onClick={handleClick}>Click me</s-button>;
  }

  // or

  export default function HandlingEvents() {
    const handleClick = () => {
      console.log('s-button clicked');
    };

    const button = document.createElement('s-button');
    button.addEventListener('click', handleClick);
    document.body.appendChild(button);
  }
  ```

## Using Forms

When building a Block extension you may use the [Form component](https://shopify.dev/docs/api/admin-extensions/latest/components/forms/form) to integrate with the contextual save bar of the resource page. The Form component provides a way to manage form state and submit data to your app's backend or directly to Shopify using Direct API access.

Whenever an input field is changed, the Form component will automatically update the dirty state of the resource page. When the form is submitted or reset the relevant callback in the form component will get triggered.

Using this, you can control what defines a component to be dirty by utilizing the Input's defaultValue property.

Rules:

* When the defaultValue is set, the component will be considered dirty if the value of the input is different from the defaultValue.You may update the defaultValue when the form is submitted to reset the dirty state of the form.

* When the defaultValue is not set, the component will be considered dirty if the value of the input is different from the initial value or from the last dynamic update to the input's value that wasn't triggered by user input.

  Note: In order to trigger the dirty state, each input must have a name attribute.

### Examples

* #### Trigger the Form's dirty state

  ##### Using \`defaultValue\`

  ```tsx
  import { render } from 'preact';
  import { useState } from 'preact/hooks';

  export default async () => {
    render(<Extension />, document.body);
  }

  const defaultValues = {
    text: 'default value',
    number: 50,
  };

  function Extension() {
    const [textValue, setTextValue] = useState('');
    const [numberValue, setNumberValue] = useState('');

    return (
      <s-admin-block title="My Block Extension">
        <s-form
          onSubmit={(event) => {
            event.waitUntil(fetch('app:save/data'));
            console.log('submit', {textValue, numberValue});
          }}
          onReset={() => console.log('automatically reset values')}
        >
          <s-stack direction="block" gap="base">
            <s-text-field
              label="Default Value"
              name="my-text"
              defaultValue={defaultValues.text}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
            />
            <s-number-field
              label="Percentage field"
              name="my-number"
              defaultValue={defaultValues.number}
              value={numberValue}
              onChange={(e) => setNumberValue(e.target.value)}
            />
          </s-stack>
        </s-form>
      </s-admin-block>
    );
  }
  ```

  ##### Using implicit default

  ```tsx
  import { render } from 'preact';
  import { useState } from 'preact/hooks';

  export default async () => {
    render(<Extension />, document.body);
  }

  async function Extension() {
    const data = await fetch('/data.json');
    const {text, number} = await data.json();
    return <App text={text} number={number} />;
  }

  function App({text, number}) {
    // The initial values set in the form fields will be the default values
    const [textValue, setTextValue] = useState(text);
    const [numberValue, setNumberValue] = useState(number);

    return (
      <s-admin-block title="My Block Extension">
        <s-form
          onSubmit={(event) => {
            event.waitUntil(fetch('app:data/save'));
            console.log('submit', {textValue, numberValue});
          }
          onReset={() => console.log('automatically reset values')}
        >
          <s-stack direction="block" gap="base">
            <s-text-field
              label="Default Value"
              name="my-text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
            />
            <s-number-field
              label="Percentage field"
              name="my-number"
              value={numberValue}
              onChange={(e) => setNumberValue(e.target.value)}
            />
          </s-stack>
        </s-form>
      </s-admin-block>
    );
  }
  ```

## Picking Resources

Use the Resource Picker and Picker API's to allow users to select resources for your extension to use.

Resource Picker

Use the `resourcePicker` API to display a search-based interface to help users find and select one or more products, collections, or product variants, and then return the selected resources to your extension. Both the app and the user must have the necessary permissions to access the resources selected.

Picker

Use the `picker` API to display a search-based interface to help users find and select one or more custom data types that you provide, such as product reviews, email templates, or subscription options.

### Examples

* #### resourcePicker

  ##### Selecting a product

  ```tsx
  import { render } from 'preact';

  export default async () => {
    render(<Extension />, document.body);
  }


  function Extension() {
    const handleSelectProduct = async () => {
      const selected = await shopify.resourcePicker({ type: 'product' });
      console.log(selected);
    };

    return <s-button onClick={handleSelectProduct}>Select product</s-button>;
  }
  ```

![](https://shopify.dev/images/templated-apis-screenshots/admin-extensions/2025-10/resource-picker.png)

![](https://shopify.dev/images/templated-apis-screenshots/admin-extensions/2025-10/picker.png)

## Deploying

Use the Shopify CLI to [deploy your app and its extensions](https://shopify.dev/docs/apps/deployment/extension).

### Examples

* #### Deploy an extension

  ##### CLI

  ```bash
  # navigate to your app's root directory:
  cd my-app

  # deploy your app and its extensions:
  shopify app deploy

  # follow the steps to deploy
  ```
