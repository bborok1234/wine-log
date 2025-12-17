import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  if (data?.claims) await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/login", req.url), { status: 302 });
}


