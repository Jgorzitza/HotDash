import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import type { LoaderFunction } from "react-router";
import { Card, Page, Layout, DataTable, Button, Text, Badge, ButtonGroup } from "@shopify/polaris";
import { createClient } from "@supabase/supabase-js";
import { AssignPickerModal } from "../components/picker-payments/AssignPickerModal";
import { RecordPaymentModal } from "../components/picker-payments/RecordPaymentModal";

interface PickerBalance {
  id: string;
  name: string;
  email: string;
  active: boolean;
  total_earnings_cents: number;
  total_paid_cents: number;
  balance_cents: number;
  orders_fulfilled: number;
  last_earning_date: string | null;
  last_payment_date: string | null;
}

interface UnassignedOrder {
  id: string;
  shopify_order_id: string;
  fulfilled_at: string;
  total_price: string;
  line_item_count: number;
  total_items: number;
}

interface LoaderData {
  pickerBalances: PickerBalance[];
  unassignedOrders: UnassignedOrder[];
}

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase credentials not configured");
    return Response.json({
      pickerBalances: [],
      unassignedOrders: [],
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch picker balances from view
  const { data: balances, error: balancesError } = await supabase
    .from("picker_balances")
    .select("*")
    .order("balance_cents", { ascending: false });

  if (balancesError) {
    console.error("Error fetching picker balances:", balancesError);
  }

  // Fetch unassigned fulfilled orders from view
  const { data: orders, error: ordersError } = await supabase
    .from("unassigned_fulfilled_orders")
    .select("*")
    .limit(50);

  if (ordersError) {
    console.error("Error fetching unassigned orders:", ordersError);
  }

  const loaderData: LoaderData = {
    pickerBalances: balances || [],
    unassignedOrders: orders || [],
  };

  return Response.json(loaderData);
};

export default function PickerPayments() {
  const { pickerBalances, unassignedOrders } = useLoaderData<LoaderData>();
  const [assignModalActive, setAssignModalActive] = useState(false);
  const [paymentModalActive, setPaymentModalActive] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");

  // Format currency helper
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle assign picker button click
  const handleAssignPicker = (orderId: string) => {
    setSelectedOrderId(orderId);
    setAssignModalActive(true);
  };

  // Picker balances table rows
  const pickerRows = pickerBalances.map((picker) => [
    picker.name,
    picker.email,
    picker.active ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>,
    picker.orders_fulfilled.toString(),
    formatCurrency(picker.total_earnings_cents),
    formatCurrency(picker.total_paid_cents),
    <Text as="span" fontWeight="bold" tone={picker.balance_cents > 0 ? "critical" : "success"}>
      {formatCurrency(picker.balance_cents)}
    </Text>,
    formatDate(picker.last_earning_date),
  ]);

  // Unassigned orders table rows
  const orderRows = unassignedOrders.map((order) => [
    order.shopify_order_id,
    formatDate(order.fulfilled_at),
    order.line_item_count.toString(),
    order.total_items.toString(),
    order.total_price,
    <Button size="slim" onClick={() => handleAssignPicker(order.shopify_order_id)}>
      Assign Picker
    </Button>,
  ]);

  // Active pickers for modal
  const activePickers = pickerBalances
    .filter((p) => p.active)
    .map((p) => ({ email: p.email, name: p.name }));

  // Pickers with balance for payment modal
  const pickersWithBalance = pickerBalances.map((p) => ({
    email: p.email,
    name: p.name,
    balance_cents: p.balance_cents,
  }));

  return (
    <Page
      title="Picker Payments"
      subtitle="Manage picker earnings, payments, and order assignments"
      primaryAction={{
        content: "Record Payment",
        onAction: () => setPaymentModalActive(true),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="h2" variant="headingMd">
              Picker Balances
            </Text>
            <div style={{ marginTop: "1rem" }}>
              <DataTable
                columnContentTypes={[
                  "text",
                  "text",
                  "text",
                  "numeric",
                  "numeric",
                  "numeric",
                  "numeric",
                  "text",
                ]}
                headings={[
                  "Name",
                  "Email",
                  "Status",
                  "Orders",
                  "Total Earned",
                  "Total Paid",
                  "Balance",
                  "Last Earning",
                ]}
                rows={pickerRows}
              />
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Text as="h2" variant="headingMd">
              Unassigned Fulfilled Orders
            </Text>
            <Text as="p" tone="subdued">
              Orders awaiting picker assignment for payment calculation
            </Text>
            <div style={{ marginTop: "1rem" }}>
              <DataTable
                columnContentTypes={["text", "text", "numeric", "numeric", "numeric", "text"]}
                headings={[
                  "Order ID",
                  "Fulfilled Date",
                  "Line Items",
                  "Total Items",
                  "Total Price",
                  "Action",
                ]}
                rows={orderRows}
              />
            </div>
          </Card>
        </Layout.Section>
      </Layout>

      <AssignPickerModal
        active={assignModalActive}
        onClose={() => setAssignModalActive(false)}
        orderId={selectedOrderId}
        pickers={activePickers}
      />

      <RecordPaymentModal
        active={paymentModalActive}
        onClose={() => setPaymentModalActive(false)}
        pickers={pickersWithBalance}
      />
    </Page>
  );
}

