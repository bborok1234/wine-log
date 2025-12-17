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


