import { NextResponse } from "next/server";

import { requireAuthedUser } from "@/lib/house";
import { createClient } from "@/lib/supabase/server";
import { generateJson } from "@/lib/ai/gemini";

interface AnalyzeLabelRequestBody {
  base64Data?: string;
  mimeType?: string;
}

interface ParsedWine {
  producer: string | null;
  name: string | null;
  vintage: number | null;
  country: string | null;
  region: string | null;
  type: "red" | "white" | "sparkling" | "rose" | "dessert" | "fortified" | "other" | null;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  await requireAuthedUser(supabase);

  const body = (await req.json().catch(() => ({}))) as AnalyzeLabelRequestBody;
  const base64Data = typeof body.base64Data === "string" ? body.base64Data.trim() : "";
  const mimeType = typeof body.mimeType === "string" ? body.mimeType.trim() : "";

  if (!base64Data || !mimeType)
    return NextResponse.json({ error: "base64Data/mimeType가 필요합니다." }, { status: 400 });

  const prompt = [
    "너는 와인 라벨 이미지에서 와인 정보를 추출하는 도우미야.",
    "이미지를 보고 JSON만 출력해.",
    "",
    "규칙:",
    "- 반드시 JSON 객체 하나만 출력(마크다운/설명 금지).",
    "- 필드: producer,name,vintage,country,region,type",
    "- vintage는 4자리 연도면 number, 없으면 null.",
    "- type은 다음 중 하나: red|white|sparkling|rose|dessert|fortified|other (모르면 other 또는 null)",
    "- producer/name은 확실하지 않으면 null 허용.",
  ].join("\n");

  const parsed = await generateJson<ParsedWine>({
    prompt,
    inlineData: { data: base64Data, mimeType },
  });

  return NextResponse.json({ data: parsed });
}


