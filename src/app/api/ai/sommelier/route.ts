import { NextResponse } from "next/server";

import { generateJson } from "@/lib/ai/openai";
import { requireAuthedUser, requireHouseAccess } from "@/lib/house";
import { parseSommelierAdvice, type SommelierAdvice } from "@/lib/sommelier-advice";
import { createClient } from "@/lib/supabase/server";

interface SommelierRequestBody {
  houseId?: string;
  wineId?: string;
  forceRefresh?: boolean;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  await requireAuthedUser(supabase);

  const body = (await req.json().catch(() => ({}))) as SommelierRequestBody;
  const houseId = typeof body.houseId === "string" ? body.houseId.trim() : "";
  const wineId = typeof body.wineId === "string" ? body.wineId.trim() : "";
  const forceRefresh = body.forceRefresh === true;

  if (!houseId || !wineId)
    return NextResponse.json(
      { error: "houseId/wineId가 필요합니다." },
      { status: 400 }
    );

  await requireHouseAccess(supabase, houseId);

  const wine = await supabase
    .from("wines")
    .select("*")
    .eq("house_id", houseId)
    .eq("id", wineId)
    .maybeSingle();

  if (wine.error)
    return NextResponse.json({ error: wine.error.message }, { status: 500 });
  if (!wine.data)
    return NextResponse.json(
      { error: "와인을 찾을 수 없어요." },
      { status: 404 }
    );

  const row = wine.data;
  const cachedAdvice = parseSommelierAdvice(row.sommelier_advice);

  if (!forceRefresh && cachedAdvice) {
    return NextResponse.json({ data: cachedAdvice });
  }

  const prompt = [
    "너는 집 와인 셀러에서 와인을 마시기 전에 참고할 'AI 소믈리에'야.",
    "아래 와인 정보를 기반으로 짧고 유용한 조언을 JSON만 출력해.",
    "",
    "출력 JSON 스키마:",
    "{ description: string, pairing: string, servingTemp: string, grapeVariety: string|null }",
    "",
    "규칙:",
    "- description: 한국어 1~2문장, 향/맛/바디/피니시 느낌을 상상해서 제안.",
    "- pairing: 음식 2~3개 예시를 콤마로. 한국 음식/간단한 요리 우선.",
    "- servingTemp: '8~10°C' 같은 범위 문자열.",
    "- grapeVariety: 라벨/정보에 없으면 지역/스타일을 근거로 합리적으로 추정(예: 샤블리→샤르도네, 끼안티→산지오베제 다수). 정말 모르면 null.",
    "- 모든 텍스트는 한국어.",
    "",
    "와인:",
    JSON.stringify({
      producer: row.producer,
      name: row.name,
      vintage: row.vintage,
      type: row.type,
      region: row.region,
      country: row.country,
      avg_purchase_price: Number(row.avg_purchase_price ?? 0),
      rating: row.rating,
      comment: row.comment,
      tasting_review: row.tasting_review,
      stock_qty: row.stock_qty,
    }),
  ].join("\n");

  const sommelierSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      description: { type: "string" },
      pairing: { type: "string" },
      servingTemp: { type: "string" },
      grapeVariety: { type: ["string", "null"] },
    },
    required: ["description", "pairing", "servingTemp", "grapeVariety"],
  } as const;

  const advice = await generateJson<SommelierAdvice>({
    prompt,
    jsonSchema: {
      name: "sommelier_advice",
      schema: sommelierSchema,
      strict: true,
    },
  });

  // cache result on the wine to avoid repeated token usage
  await supabase
    .from("wines")
    .update({ sommelier_advice: advice })
    .eq("id", wineId)
    .eq("house_id", houseId);

  return NextResponse.json({ data: advice });
}
