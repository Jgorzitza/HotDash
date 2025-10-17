import React, { useState } from "react";
import { Button, Modal, BlockStack, Text } from "@shopify/polaris";

export function IdeaDrawerHarness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} data-testid="open-ideas-drawer">
        Open Idea
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Idea details"
        large
      >
        <Modal.Section>
          <BlockStack gap="200">
            <Text as="p">Example idea content</Text>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
