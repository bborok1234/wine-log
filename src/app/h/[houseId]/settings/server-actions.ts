"use server";

import { redirect } from "next/navigation";

import { setFlash } from "@/lib/flash";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createInvite(formData: FormData) {
  const houseId = getString(formData, "houseId");
  if (!houseId) redirect("/app?error=bad-request");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase.rpc("rpc_create_invite", {
    p_house_id: houseId,
    p_role: "editor",
  });

  if (error) {
    await setFlash({ kind: "error", message: error.message });
    redirect(`/h/${houseId}/settings`);
  }

  await setFlash({ kind: "success", message: `/invite/${data}` });
  redirect(`/h/${houseId}/settings`);
}
