"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { setFlash } from "@/lib/flash";

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
  const { error } = await supabase.rpc("rpc_open_bottle", { p_wine_id: wineId });
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


