import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { createClient } from "@supabase/supabase-js";

export const action = async ({ request }: ActionFunctionArgs) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const formData = await request.formData();

  const pickerEmail = formData.get("pickerEmail") as string;
  const amountCents = parseInt(formData.get("amountCents") as string, 10);
  const notes = formData.get("notes") as string;
  const paidAt = formData.get("paidAt") as string;

  if (!pickerEmail || !amountCents || !paidAt) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Insert payment record
  const { error } = await supabase.from("picker_payments").insert({
    picker_email: pickerEmail,
    amount_cents: amountCents,
    paid_at: paidAt,
    notes: notes || null,
  });

  if (error) {
    console.error("Error recording payment:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return redirect("/app/picker-payments");
};

