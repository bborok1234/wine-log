import { NextResponse } from "next/server";

import { generateJson } from "@/lib/ai/openai";
import { requireAuthedUser, requireHouseAccess } from "@/lib/house";
import { createClient } from "@/lib/supabase/server";

interface RecommendRequestBody {
  houseId?: string;
  note?: string;
  preferredType?:
    | "red"
    | "white"
    | "sparkling"
    | "rose"
    | "dessert"
    | "fortified"
    | "other"
    | "any";
  priceBand?: "lt50k" | "lt100k" | "gte100k" | "any";
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
  const note = typeof body.note === "string" ? body.note.trim() : "";
  const preferredTypeRaw =
    typeof body.preferredType === "string" ? body.preferredType.trim() : "";
  const preferredType =
    preferredTypeRaw === "red" ||
    preferredTypeRaw === "white" ||
    preferredTypeRaw === "sparkling" ||
    preferredTypeRaw === "rose" ||
    preferredTypeRaw === "dessert" ||
    preferredTypeRaw === "fortified" ||
    preferredTypeRaw === "other"
      ? preferredTypeRaw
      : "any";
  const priceBandRaw = typeof body.priceBand === "string" ? body.priceBand : "";
  const priceBand =
    priceBandRaw === "lt50k" ||
    priceBandRaw === "lt100k" ||
    priceBandRaw === "gte100k"
      ? priceBandRaw
      : "any";
  if (!houseId)
    return NextResponse.json(
      { error: "houseId가 필요합니다." },
      { status: 400 }
    );

  await requireHouseAccess(supabase, houseId);

  let wineQuery = supabase
    .from("wines")
    .select("id,producer,name,vintage,type,region,country,avg_purchase_price")
    .eq("house_id", houseId)
    .gt("stock_qty", 0);

  if (preferredType !== "any") {
    wineQuery = wineQuery.eq("type", preferredType);
  }
  if (priceBand === "lt50k") {
    wineQuery = wineQuery.lte("avg_purchase_price", 50000);
  } else if (priceBand === "lt100k") {
    wineQuery = wineQuery.lte("avg_purchase_price", 100000);
  } else if (priceBand === "gte100k") {
    wineQuery = wineQuery.gte("avg_purchase_price", 100000);
  }

  const wines = await wineQuery;

  if (wines.error)
    return NextResponse.json({ error: wines.error.message }, { status: 500 });

  if (!wines.data?.length)
    return NextResponse.json(
      { error: "보유 중인 와인이 없어요." },
      { status: 400 }
    );

  const candidates = wines.data;

  const lines = candidates.map((w) => {
    const parts = [
      `id=${w.id}`,
      w.producer,
      w.name ?? "",
      w.vintage ? String(w.vintage) : "NV",
      `[${w.type ?? "other"}]`,
      `avg_price=${Number(w.avg_purchase_price ?? 0)}`,
    ]
      .map((v) => String(v).trim())
      .filter(Boolean)
      .join(" ");
    return parts;
  });

  const prompt = [
    "너는 집 와인 셀러의 '오늘 뭐 마시지?' 추천 소믈리에야.",
    "아래 후보들 중에서 오늘 마시기 좋은 와인 최대 3개를 골라서 JSON 배열로 출력해. (1~3개)",
    "",
    "출력 JSON 스키마:",
    "{ recommendations: [{ wineId: string, reason: string, pairing: string }] }",
    "",
    "규칙:",
    "- wineId는 후보 리스트의 id 중 하나여야 함",
    "- 서로 다른 와인을 최대 3개 추천하고, 가능하면 다양하게 제안. 중복 금지.",
    "- 타입/가격 필터는 이미 적용된 목록이므로 남은 후보 안에서 메모에 나온 음식/분위기/빈티지 선호를 반영해. 오래된 빈티지 언급이 있으면 더 오래된 연도 쪽을 우선.",
    "- reason은 한국어 1~2문장, pairing은 한국어 1문장",
    "- 너무 장황하지 않게(모바일 UI용)",
    note ? `- 요청 메모: "${note}"` : undefined,
    preferredType !== "any"
      ? `- 선호 타입: ${preferredType} 계열을 우선 고려`
      : undefined,
    priceBand !== "any"
      ? `- 예산대: ${
          priceBand === "lt50k"
            ? "5만원 미만"
            : priceBand === "lt100k"
            ? "10만원 미만"
            : "10만원 이상"
        }`
      : undefined,
    "",
    "후보(각 줄은 JSON):",
    ...lines,
  ]
    .filter(Boolean)
    .join("\n");

  const recommendationSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      recommendations: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            wineId: { type: "string" },
            reason: { type: "string" },
            pairing: { type: "string" },
          },
          required: ["wineId", "reason", "pairing"],
        },
      },
    },
    required: ["recommendations"],
  } as const;

  const recPayload = await generateJson<{ recommendations: Recommendation[] }>({
    prompt,
    jsonSchema: {
      name: "recommendation",
      schema: recommendationSchema,
      strict: true,
    },
  });

  const recList = recPayload.recommendations ?? [];

  const pickedList = recList.map((rec) => {
    const picked = wines.data.find((w) => w.id === rec.wineId) ?? null;
    return {
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
    };
  });

  return NextResponse.json({
    data: pickedList,
  });
}
