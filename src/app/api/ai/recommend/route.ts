import { NextResponse } from "next/server";

import { generateJson } from "@/lib/ai/openai";
import { requireAuthedUser, requireHouseAccess } from "@/lib/house";
import { createClient } from "@/lib/supabase/server";

interface RecommendRequestBody {
  houseId?: string;
}

interface Recommendation {
  wineId: string;
  reason: string;
  pairing: string;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  await requireAuthedUser(supabase);

  const body = (await req.json().catch(() => ({}))) as RecommendRequestBody;
  const houseId = typeof body.houseId === "string" ? body.houseId.trim() : "";
  if (!houseId)
    return NextResponse.json(
      { error: "houseId가 필요합니다." },
      { status: 400 }
    );

  await requireHouseAccess(supabase, houseId);

  const wines = await supabase
    .from("wines")
    .select(
      "id,producer,name,vintage,country,region,type,stock_qty,avg_purchase_price,rating"
    )
    .eq("house_id", houseId)
    .gt("stock_qty", 0)
    .order("stock_qty", { ascending: false })
    .limit(60);

  if (wines.error)
    return NextResponse.json({ error: wines.error.message }, { status: 500 });

  if (!wines.data?.length)
    return NextResponse.json(
      { error: "보유 중인 와인이 없어요." },
      { status: 400 }
    );

  const lines = wines.data.map((w) =>
    JSON.stringify({
      id: w.id,
      producer: w.producer,
      name: w.name,
      vintage: w.vintage,
      type: w.type,
      region: w.region,
      country: w.country,
      stock_qty: w.stock_qty,
      avg_purchase_price: Number(w.avg_purchase_price ?? 0),
      rating: w.rating,
    })
  );

  const prompt = [
    "너는 집 와인 셀러의 '오늘 뭐 마시지?' 추천 소믈리에야.",
    "아래 후보들 중에서 오늘 마시기 좋은 와인 1개를 골라서 JSON만 출력해.",
    "",
    "출력 JSON 스키마:",
    "{ wineId: string, reason: string, pairing: string }",
    "",
    "규칙:",
    "- wineId는 후보 리스트의 id 중 하나여야 함",
    "- reason은 한국어 1~2문장, pairing은 한국어 1문장",
    "- 너무 장황하지 않게(모바일 UI용)",
    "",
    "후보(각 줄은 JSON):",
    ...lines,
  ].join("\n");

  const recommendationSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      wineId: { type: "string" },
      reason: { type: "string" },
      pairing: { type: "string" },
    },
    required: ["wineId", "reason", "pairing"],
  } as const;

  const rec = await generateJson<Recommendation>({
    prompt,
    jsonSchema: {
      name: "recommendation",
      schema: recommendationSchema,
      strict: true,
    },
  });

  const picked = wines.data.find((w) => w.id === rec.wineId) ?? null;
  return NextResponse.json({
    data: {
      ...rec,
      wine: picked
        ? {
            id: picked.id,
            producer: picked.producer,
            name: picked.name,
            vintage: picked.vintage,
            type: picked.type,
            region: picked.region,
            country: picked.country,
          }
        : null,
    },
  });
}
