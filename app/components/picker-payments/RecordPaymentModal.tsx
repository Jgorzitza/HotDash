import { useState } from "react";
import { Modal, FormLayout, TextField, Select } from "@shopify/polaris";
import { Form } from "react-router";

interface RecordPaymentModalProps {
  active: boolean;
  onClose: () => void;
  pickers: Array<{ email: string; name: string; balance_cents: number }>;
}

export function RecordPaymentModal({ active, onClose, pickers }: RecordPaymentModalProps) {
  const [pickerEmail, setPickerEmail] = useState("");
  const [amountDollars, setAmountDollars] = useState("");
  const [notes, setNotes] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);

  const pickerOptions = pickers.map((picker) => ({
    label: `${picker.name} (Balance: $${(picker.balance_cents / 100).toFixed(2)})`,
    value: picker.email,
  }));

  const selectedPicker = pickers.find((p) => p.email === pickerEmail);
  const amountCents = Math.round(parseFloat(amountDollars || "0") * 100);

  return (
    <Modal
      open={active}
      onClose={onClose}
      title="Record Payment"
      primaryAction={{
        content: "Record Payment",
        onAction: () => {
          // Form will be submitted via Form component
          const form = document.querySelector('form[action="/app/picker-payments/record-payment"]') as HTMLFormElement;
          if (form) form.submit();
        },
        disabled: !pickerEmail || !amountDollars || amountCents <= 0,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <Form method="post" action="/app/picker-payments/record-payment">
          <input type="hidden" name="pickerEmail" value={pickerEmail} />
          <input type="hidden" name="amountCents" value={amountCents.toString()} />
          <input type="hidden" name="paidAt" value={paidAt} />
          <input type="hidden" name="notes" value={notes} />

          <FormLayout>
            <Select
              label="Picker"
              options={[{ label: "Select picker", value: "" }, ...pickerOptions]}
              value={pickerEmail}
              onChange={setPickerEmail}
            />

            {selectedPicker && (
              <TextField
                label="Current Balance"
                value={`$${(selectedPicker.balance_cents / 100).toFixed(2)}`}
                disabled
                autoComplete="off"
              />
            )}

            <TextField
              label="Payment Amount"
              type="number"
              value={amountDollars}
              onChange={setAmountDollars}
              prefix="$"
              min={0}
              step={0.01}
              autoComplete="off"
              helpText="Amount paid to picker"
            />

            <TextField
              label="Payment Date"
              type="date"
              value={paidAt}
              onChange={setPaidAt}
              autoComplete="off"
            />

            <TextField
              label="Notes (optional)"
              value={notes}
              onChange={setNotes}
              multiline={3}
              autoComplete="off"
              helpText="Payment method, check number, etc."
            />
          </FormLayout>
        </Form>
      </Modal.Section>
    </Modal>
  );
}

