"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { setFlash } from "@/lib/flash";

export async function openBottle(formData: FormData) {
  const houseId = String(formData.get("houseId") ?? "");
  const wineId = String(formData.get("wineId") ?? "");

  if (!houseId || !wineId) redirect(`/app?error=${encodeURIComponent("잘못된 요청")}`);

  const supabase = await createClient();
  const { error } = await supabase.rpc("rpc_open_bottle", { p_wine_id: wineId });

  if (error) {
    await setFlash({ kind: "error", message: error.message });
    redirect(`/h/${houseId}/cellar`);
  }

  revalidatePath(`/h/${houseId}/cellar`);
}

export async function restoreBottle(formData: FormData) {
  const houseId = String(formData.get("houseId") ?? "");
  const wineId = String(formData.get("wineId") ?? "");

  if (!houseId || !wineId)
    redirect(`/app?error=${encodeURIComponent("잘못된 요청")}`);

  const supabase = await createClient();

  const current = await supabase
    .from("wines")
    .select("stock_qty,purchase_qty_total")
    .eq("id", wineId)
    .eq("house_id", houseId)
    .maybeSingle();

  if (current.error || !current.data) {
    await setFlash({
      kind: "error",
      message: current.error?.message ?? "와인을 찾을 수 없어요.",
    });
    redirect(`/h/${houseId}/cellar`);
  }

  const stockQty = Number(current.data.stock_qty ?? 0);
  const purchaseQtyTotal = Number(current.data.purchase_qty_total ?? 0);
  const nextStockQty = Math.min(stockQty + 1, purchaseQtyTotal);

  const { error } = await supabase
    .from("wines")
    .update({ stock_qty: nextStockQty })
    .eq("id", wineId)
    .eq("house_id", houseId);

  if (error) {
    await setFlash({ kind: "error", message: error.message });
    redirect(`/h/${houseId}/cellar`);
  }

  revalidatePath(`/h/${houseId}/cellar`);
  revalidatePath(`/h/${houseId}/wine/${wineId}`);
}


