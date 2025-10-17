import { Page, Layout, Card, BlockStack, Text } from "@shopify/polaris";
import { IdeaDrawerHarness } from "../../components/ideas/IdeaDrawerHarness";

export default function IdeasRoute() {
  return (
    <div data-testid="ideas-page">
      <Page title="Idea Pool">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="p" tone="subdued">
                  Minimal harness to validate drawer open/close behavior.
                </Text>
                <IdeaDrawerHarness />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </div>
  );
}
