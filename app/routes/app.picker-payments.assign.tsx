import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { createClient } from "@supabase/supabase-js";

interface AssignPickerPayload {
  orderId: string;
  pickerEmail: string;
  totalPieces: number;
  payoutCents: number;
  bracket: string;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const formData = await request.formData();

  const orderId = formData.get("orderId") as string;
  const pickerEmail = formData.get("pickerEmail") as string;
  const totalPieces = parseInt(formData.get("totalPieces") as string, 10);

  if (!orderId || !pickerEmail || !totalPieces) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Calculate payout based on bracket
  let payoutCents: number;
  let bracket: string;

  if (totalPieces >= 1 && totalPieces <= 4) {
    payoutCents = 200; // $2.00
    bracket = "1-4";
  } else if (totalPieces >= 5 && totalPieces <= 10) {
    payoutCents = 400; // $4.00
    bracket = "5-10";
  } else {
    payoutCents = 700; // $7.00
    bracket = "11+";
  }

  // Insert picker earning record
  const { error: earningError } = await supabase.from("picker_earnings").insert({
    order_id: orderId,
    picker_email: pickerEmail,
    total_pieces: totalPieces,
    payout_cents: payoutCents,
    bracket: bracket,
  });

  if (earningError) {
    console.error("Error creating picker earning:", earningError);
    return Response.json({ error: earningError.message }, { status: 500 });
  }

  // Update order with picker assignment
  const { error: orderError } = await supabase
    .from("orders")
    .update({
      assigned_picker: pickerEmail,
      pieces_count: totalPieces,
      picker_payout: payoutCents,
    })
    .eq("shopify_order_id", orderId);

  if (orderError) {
    console.error("Error updating order:", orderError);
    // Note: earning record already created, but order update failed
    // This is acceptable - the earning is recorded even if order update fails
  }

  return redirect("/app/picker-payments");
};

