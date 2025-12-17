"use server";

import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { requireAuthedUser } from "@/lib/house";

export async function POST(req: Request) {
  const supabase = await createClient();
  await requireAuthedUser(supabase);

  const body = (await req.json().catch(() => ({}))) as { token?: string };
  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token) {
    return NextResponse.json({ error: "token이 필요합니다." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("rpc_accept_invite", { p_token: token });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: { houseId: data } });
}


