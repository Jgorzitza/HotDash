import { useState } from "react";
import { Modal, FormLayout, TextField, Select, Button } from "@shopify/polaris";
import { Form } from "react-router";

interface AssignPickerModalProps {
  active: boolean;
  onClose: () => void;
  orderId: string;
  pickers: Array<{ email: string; name: string }>;
}

export function AssignPickerModal({
  active,
  onClose,
  orderId,
  pickers,
}: AssignPickerModalProps) {
  const [pickerEmail, setPickerEmail] = useState("");
  const [totalPieces, setTotalPieces] = useState("1");

  const pickerOptions = pickers.map((picker) => ({
    label: `${picker.name} (${picker.email})`,
    value: picker.email,
  }));

  // Calculate payout preview
  const pieces = parseInt(totalPieces, 10) || 0;
  let payoutPreview = "$0.00";
  if (pieces >= 1 && pieces <= 4) {
    payoutPreview = "$2.00";
  } else if (pieces >= 5 && pieces <= 10) {
    payoutPreview = "$4.00";
  } else if (pieces >= 11) {
    payoutPreview = "$7.00";
  }

  return (
    <Modal
      open={active}
      onClose={onClose}
      title="Assign Picker to Order"
      primaryAction={{
        content: "Assign",
        onAction: () => {
          // Form will be submitted via Form component
          const form = document.querySelector('form[action="/app/picker-payments/assign"]') as HTMLFormElement;
          if (form) form.submit();
        },
        disabled: !pickerEmail || !totalPieces || pieces < 1,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <Form method="post" action="/app/picker-payments/assign">
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="pickerEmail" value={pickerEmail} />
          <input type="hidden" name="totalPieces" value={totalPieces} />

          <FormLayout>
            <TextField
              label="Order ID"
              value={orderId}
              disabled
              autoComplete="off"
            />

            <Select
              label="Picker"
              options={[{ label: "Select picker", value: "" }, ...pickerOptions]}
              value={pickerEmail}
              onChange={setPickerEmail}
            />

            <TextField
              label="Total Pieces"
              type="number"
              value={totalPieces}
              onChange={setTotalPieces}
              min={1}
              autoComplete="off"
              helpText="Number of pieces in this order for picker payment calculation"
            />

            <TextField
              label="Payout Amount"
              value={payoutPreview}
              disabled
              autoComplete="off"
              helpText="Calculated based on pieces: 1-4 = $2, 5-10 = $4, 11+ = $7"
            />
          </FormLayout>
        </Form>
      </Modal.Section>
    </Modal>
  );
}

