import { redirect } from "next/navigation";

import type { Database } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function requireAuthedUser(supabase: SupabaseClient<Database>) {
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
}

export async function requireHouseAccess(
  supabase: SupabaseClient<Database>,
  houseId: string
) {
  const { data, error } = await supabase
    .from("houses")
    .select("id,name,created_at")
    .eq("id", houseId)
    .maybeSingle();

  if (error) redirect(`/app?error=${encodeURIComponent(error.message)}`);
  if (!data) redirect(`/app?error=${encodeURIComponent("하우스 접근 권한이 없어요.")}`);

  return data;
}


