"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setFlash } from "@/lib/flash";
import { toStoredWineImagePath } from "@/lib/storage-image";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getIntOrNull(formData: FormData, key: string) {
  const raw = getString(formData, key);
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export async function openBottleFromDetail(formData: FormData) {
  const houseId = getString(formData, "houseId");
  const wineId = getString(formData, "wineId");
  if (!houseId || !wineId) redirect("/app?error=bad-request");

  const supabase = await createClient();
  const { error } = await supabase.rpc("rpc_open_bottle", {
    p_wine_id: wineId,
  });
  if (error) {
    await setFlash({ kind: "error", message: error.message });
    redirect(`/h/${houseId}/wine/${wineId}`);
  }

  revalidatePath(`/h/${houseId}/wine/${wineId}`);
  revalidatePath(`/h/${houseId}/cellar`);
}

export async function restoreBottleFromDetail(formData: FormData) {
  const houseId = getString(formData, "houseId");
  const wineId = getString(formData, "wineId");
  if (!houseId || !wineId) redirect("/app?error=bad-request");

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
    redirect(`/h/${houseId}/wine/${wineId}`);
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
    redirect(`/h/${houseId}/wine/${wineId}`);
  }

  revalidatePath(`/h/${houseId}/wine/${wineId}`);
  revalidatePath(`/h/${houseId}/cellar`);
}

export async function updateNotes(formData: FormData) {
  const houseId = getString(formData, "houseId");
  const wineId = getString(formData, "wineId");
  if (!houseId || !wineId) redirect("/app?error=bad-request");

  const rating = getIntOrNull(formData, "rating");
  const comment = getString(formData, "comment") || null;
  const tastingReview = getString(formData, "tasting_review") || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("wines")
    .update({ rating, comment, tasting_review: tastingReview })
    .eq("id", wineId)
    .eq("house_id", houseId);

  if (error) {
    await setFlash({ kind: "error", message: error.message });
    redirect(`/h/${houseId}/wine/${wineId}`);
  }

  revalidatePath(`/h/${houseId}/wine/${wineId}`);
}

export async function updateWineInfo(formData: FormData) {
  const houseId = getString(formData, "houseId");
  const wineId = getString(formData, "wineId");
  if (!houseId || !wineId) redirect("/app?error=bad-request");

  const producer = getString(formData, "producer");
  const nameRaw = getString(formData, "name");
  const name = nameRaw ? nameRaw : undefined;
  const vintageRaw = getIntOrNull(formData, "vintage");
  const vintage = vintageRaw;
  const country = getString(formData, "country") || null;
  const region = getString(formData, "region") || null;
  const type = getString(formData, "type") || null;
  const labelPath = getString(formData, "label_path");

  if (!producer) {
    await setFlash({ kind: "error", message: "생산자는 필수입니다." });
    redirect(`/h/${houseId}/wine/${wineId}`);
  }

  const supabase = await createClient();

  let nextLabelPhotoUrls: string[] | undefined = undefined;
  if (labelPath) {
    const stored = toStoredWineImagePath(labelPath);
    const current = await supabase
      .from("wines")
      .select("label_photo_urls")
      .eq("id", wineId)
      .eq("house_id", houseId)
      .maybeSingle();

    const existing = (current.data?.label_photo_urls as string[] | null) ?? [];
    nextLabelPhotoUrls = [stored, ...existing.filter((u) => u !== stored)];
  }

  const { error } = await supabase
    .from("wines")
    .update({
      producer,
      name,
      vintage,
      country,
      region,
      type,
      ...(nextLabelPhotoUrls ? { label_photo_urls: nextLabelPhotoUrls } : {}),
    })
    .eq("id", wineId)
    .eq("house_id", houseId);

  if (error) {
    await setFlash({ kind: "error", message: error.message });
    redirect(`/h/${houseId}/wine/${wineId}`);
  }

  revalidatePath(`/h/${houseId}/wine/${wineId}`);
}

export async function updatePurchase(formData: FormData) {
  const houseId = getString(formData, "houseId");
  const wineId = getString(formData, "wineId");
  const purchaseId = getString(formData, "purchaseId");
  if (!houseId || !wineId || !purchaseId) redirect("/app?error=bad-request");

  const store = getString(formData, "store");
  const unitPriceRaw = getString(formData, "unit_price");
  const quantityRaw = getString(formData, "quantity");
  const purchasedAtRaw = getString(formData, "purchased_at");
  const purchasedAt = purchasedAtRaw ? purchasedAtRaw : undefined;

  const unitPrice = Number(unitPriceRaw);
  const quantity = Number(quantityRaw);

  if (!store) {
    await setFlash({ kind: "error", message: "구매처는 필수입니다." });
    redirect(`/h/${houseId}/wine/${wineId}`);
  }
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    await setFlash({ kind: "error", message: "가격을 확인해주세요." });
    redirect(`/h/${houseId}/wine/${wineId}`);
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    await setFlash({ kind: "error", message: "수량을 확인해주세요." });
    redirect(`/h/${houseId}/wine/${wineId}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("purchases")
    .update({
      store,
      unit_price: unitPrice,
      quantity: Math.trunc(quantity),
      purchased_at: purchasedAt,
    })
    .eq("id", purchaseId)
    .eq("house_id", houseId);

  if (error) {
    await setFlash({ kind: "error", message: error.message });
    redirect(`/h/${houseId}/wine/${wineId}`);
  }

  revalidatePath(`/h/${houseId}/wine/${wineId}`);
  revalidatePath(`/h/${houseId}/cellar`);
}

export async function deleteWine(formData: FormData) {
  const houseId = getString(formData, "houseId");
  const wineId = getString(formData, "wineId");
  if (!houseId || !wineId) redirect("/app?error=bad-request");

  const supabase = await createClient();
  const { error } = await supabase
    .from("wines")
    .delete()
    .eq("id", wineId)
    .eq("house_id", houseId);

  if (error) {
    await setFlash({ kind: "error", message: error.message });
    redirect(`/h/${houseId}/wine/${wineId}`);
  }

  revalidatePath(`/h/${houseId}/cellar`);
  redirect(`/h/${houseId}/cellar`);
}

export async function deletePurchase(formData: FormData) {
  const houseId = getString(formData, "houseId");
  const purchaseId = getString(formData, "purchaseId");
  if (!houseId || !purchaseId) redirect("/app?error=bad-request");

  const supabase = await createClient();

  // 구매 기록 조회 (wine_id 확인용)
  const purchase = await supabase
    .from("purchases")
    .select("wine_id,quantity,unit_price")
    .eq("id", purchaseId)
    .eq("house_id", houseId)
    .maybeSingle();

  if (purchase.error || !purchase.data) {
    await setFlash({
      kind: "error",
      message: purchase.error?.message ?? "구매 기록을 찾을 수 없어요.",
    });
    redirect(`/h/${houseId}/cellar`);
  }

  const { wine_id, quantity, unit_price } = purchase.data;

  // 구매 기록 삭제 (트리거가 자동으로 wines 통계를 업데이트함)
  const { error: deleteError } = await supabase
    .from("purchases")
    .delete()
    .eq("id", purchaseId)
    .eq("house_id", houseId);

  if (deleteError) {
    await setFlash({ kind: "error", message: deleteError.message });
    redirect(`/h/${houseId}/wine/${wine_id}`);
  }

  revalidatePath(`/h/${houseId}/wine/${wine_id}`);
  redirect(`/h/${houseId}/wine/${wine_id}`);
}
