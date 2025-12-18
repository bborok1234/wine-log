import { NextResponse } from "next/server";

import { requireAuthedUser, requireHouseAccess } from "@/lib/house";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ houseId: string }>;
  }
) {
  const { houseId } = await params;

  const supabase = await createClient();
  await requireAuthedUser(supabase);
  await requireHouseAccess(supabase, houseId);

  const stats = await (supabase as any).rpc("rpc_cellar_stats", {
    p_house_id: houseId,
    p_q: null,
    p_stock: "all",
    p_consumed_only: false,
    p_type: null,
    p_country: null,
    p_price_min: null,
    p_price_max: null,
  });

  if (stats.error) {
    return NextResponse.json({ error: stats.error.message }, { status: 400 });
  }

  return NextResponse.json({ stats: stats.data ?? null });
}
