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

  const pageSize = 2000;
  const countries = new Set<string>();

  for (let from = 0; ; from += pageSize) {
    const page = await supabase
      .from("wines")
      .select("country")
      .eq("house_id", houseId)
      .range(from, from + pageSize - 1);

    if (page.error)
      return NextResponse.json({ error: page.error.message }, { status: 400 });

    for (const row of page.data ?? []) {
      const c = row.country?.trim();
      if (c) countries.add(c);
    }

    if ((page.data ?? []).length < pageSize) break;
  }

  return NextResponse.json({
    countries: Array.from(countries).sort((a, b) => a.localeCompare(b, "ko")),
  });
}
