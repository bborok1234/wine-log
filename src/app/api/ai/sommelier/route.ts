import { NextResponse } from "next/server";

import { generateJson } from "@/lib/ai/gemini";
import { requireAuthedUser, requireHouseAccess } from "@/lib/house";
import { createClient } from "@/lib/supabase/server";

interface SommelierRequestBody {
  houseId?: string;
  wineId?: string;
}

interface SommelierAdvice {
  description: string;
  pairing: string;
  servingTemp: string;
  grapeVariety: string | null;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  await requireAuthedUser(supabase);

  const body = (await req.json().catch(() => ({}))) as SommelierRequestBody;
  const houseId = typeof body.houseId === "string" ? body.houseId.trim() : "";
  const wineId = typeof body.wineId === "string" ? body.wineId.trim() : "";

  if (!houseId || !wineId)
    return NextResponse.json({ error: "houseId/wineId가 필요합니다." }, { status: 400 });

  await requireHouseAccess(supabase, houseId);

  const wine = await supabase
    .from("wines")
    .select("id,producer,name,vintage,country,region,type,avg_purchase_price,rating,comment,tasting_review,stock_qty")
    .eq("house_id", houseId)
    .eq("id", wineId)
    .maybeSingle();

  if (wine.error)
    return NextResponse.json({ error: wine.error.message }, { status: 500 });
  if (!wine.data)
    return NextResponse.json({ error: "와인을 찾을 수 없어요." }, { status: 404 });

  const prompt = [
    "너는 집 와인 셀러에서 와인을 마시기 전에 참고할 'AI 소믈리에'야.",
    "아래 와인 정보를 기반으로 짧고 유용한 조언을 JSON만 출력해.",
    "",
    "출력 JSON 스키마:",
    "{ description: string, pairing: string, servingTemp: string, grapeVariety: string|null }",
    "",
    "규칙:",
    "- description은 한국어 1~2문장(향/맛/바디/피니시 느낌을 상상해서 제안)",
    "- pairing은 음식 2~3개 예시를 콤마로",
    "- servingTemp는 '8~10°C' 같은 범위 문자열",
    "- grapeVariety는 확실치 않으면 null",
    "",
    "와인:",
    JSON.stringify({
      producer: wine.data.producer,
      name: wine.data.name,
      vintage: wine.data.vintage,
      type: wine.data.type,
      region: wine.data.region,
      country: wine.data.country,
      avg_purchase_price: Number(wine.data.avg_purchase_price ?? 0),
      rating: wine.data.rating,
      comment: wine.data.comment,
      tasting_review: wine.data.tasting_review,
      stock_qty: wine.data.stock_qty,
    }),
  ].join("\n");

  const advice = await generateJson<SommelierAdvice>({ prompt });
  return NextResponse.json({ data: advice });
}


