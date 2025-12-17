"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { setFlash } from "@/lib/flash";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string) {
  const raw = getString(formData, key);
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}

export async function savePurchase(formData: FormData) {
  const houseId = getString(formData, "houseId");
  const existingWineId = getString(formData, "wineId");

  const producer = getString(formData, "producer");
  const name = getString(formData, "name");
  const vintage = getNumber(formData, "vintage");
  const country = getString(formData, "country") || null;
  const region = getString(formData, "region") || null;
  const type = getString(formData, "type") || null;

  const unitPrice = getNumber(formData, "unit_price");
  const quantity = getNumber(formData, "quantity");
  const store = getString(formData, "store");
  const purchasedAt = getString(formData, "purchased_at") || null;
  const receiptPhotoUrl = getString(formData, "receipt_photo_url") || null;

  if (!houseId) {
    await setFlash({ kind: "error", message: "houseId 누락" });
    redirect("/app");
  }
  if (!store) {
    await setFlash({ kind: "error", message: "구매처는 필수입니다." });
    redirect(`/h/${houseId}/purchase/new`);
  }
  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    await setFlash({ kind: "error", message: "가격을 확인해주세요." });
    redirect(`/h/${houseId}/purchase/new`);
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    await setFlash({ kind: "error", message: "수량을 확인해주세요." });
    redirect(`/h/${houseId}/purchase/new`);
  }

  const supabase = await createClient();

  let wineId = existingWineId;
  if (!wineId) {
    if (!producer || !name || !Number.isFinite(vintage)) {
      await setFlash({
        kind: "error",
        message: "와인 정보(생산자/이름/빈티지)는 필수입니다.",
      });
      redirect(`/h/${houseId}/purchase/new`);
    }

    const created = await supabase
      .from("wines")
      .insert({
        house_id: houseId,
        producer,
        name,
        vintage: Math.trunc(vintage),
        country,
        region,
        type,
      })
      .select("id")
      .single();

    if (created.error || !created.data)
      {
        await setFlash({
          kind: "error",
          message: created.error?.message ?? "와인 생성 실패",
        });
        redirect(`/h/${houseId}/purchase/new`);
      }

    wineId = created.data.id;
  }

  const inserted = await supabase.from("purchases").insert({
    house_id: houseId,
    wine_id: wineId,
    store,
    unit_price: unitPrice,
    quantity: Math.trunc(quantity),
    purchased_at: purchasedAt ?? undefined,
    receipt_photo_url: receiptPhotoUrl,
  });

  if (inserted.error)
    {
      await setFlash({ kind: "error", message: inserted.error.message });
      redirect(`/h/${houseId}/purchase/new`);
    }

  revalidatePath(`/h/${houseId}/cellar`);
  redirect(`/h/${houseId}/cellar`);
}


