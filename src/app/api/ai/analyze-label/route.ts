import { NextResponse } from "next/server";

import { generateJson } from "@/lib/ai/openai";
import { requireAuthedUser } from "@/lib/house";
import { createClient } from "@/lib/supabase/server";

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
  type:
    | "red"
    | "white"
    | "sparkling"
    | "rose"
    | "dessert"
    | "fortified"
    | "other"
    | null;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  await requireAuthedUser(supabase);

  const body = (await req.json().catch(() => ({}))) as AnalyzeLabelRequestBody;
  const base64Data =
    typeof body.base64Data === "string" ? body.base64Data.trim() : "";
  const mimeType =
    typeof body.mimeType === "string" ? body.mimeType.trim() : "";

  if (!base64Data || !mimeType)
    return NextResponse.json(
      { error: "base64Data/mimeType가 필요합니다." },
      { status: 400 }
    );

  const prompt = [
    "너는 와인 라벨 이미지를 보고 정보를 추출하는 도우미야.",
    "반드시 **JSON만** 출력해. (마크다운/설명/여분 텍스트 금지)",
    "",
    "중요 규칙(정확도 최우선):",
    "- 라벨에서 실제로 보이는 텍스트를 근거로 추출해. 절대 지어내지 마.",
    "- producer는 '도멘/샤또/와이너리/하우스' 같은 생산자 이름만. cuvée/밭/클라이멧/수식어는 name으로.",
    "- name은 cuvée/밭/클라이멧/수식어까지 포함해서 최대한 라벨 그대로(예: 'Les Pomards Vieilles Vignes').",
    "- 영어/프랑스어가 보이면 한국어로 음역/번역(단, 고유명사는 보이는 철자를 우선).",
    "- Domaine는 '도멘'으로, Château는 '샤또'로 표기(가능하면).",
    "- vintage는 라벨에서 보이는 4자리 연도면 number, 없으면 null.",
    "- country는 국가명만(예: 프랑스/이탈리아/미국/스페인/독일/칠레/아르헨티나/호주/뉴질랜드/남아공/포르투갈/오스트리아/헝가리/그리스/우루과이/일본/중국).",
    "- region은 AOC/지역/산지(예: 부르고뉴, 생-베랑, 토스카나 등).",
    "- type: red|white|sparkling|rose|dessert|fortified|other. 모르면 other 또는 null.",
    "- 확실치 않은 필드는 null.",
    "",
    "예시(설명용, 그대로 출력하지 말 것):",
    "입력: Domaine Robert-Denogent / Saint-Véran / Les Pomards Vieilles Vignes / 2025",
    "출력: producer='도멘 로베르-드노장', name='생-베랑 레 포마르 비에이 비뉴', vintage=2025, region='부르고뉴', country='프랑스'",
  ].join("\n");

  const parsedWineSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      producer: { type: ["string", "null"] },
      name: { type: ["string", "null"] },
      vintage: { type: ["integer", "null"] },
      country: {
        type: ["string", "null"],
        enum: [
          "프랑스",
          "이탈리아",
          "미국",
          "스페인",
          "독일",
          "칠레",
          "아르헨티나",
          "호주",
          "뉴질랜드",
          "남아공",
          "포르투갈",
          "오스트리아",
          "헝가리",
          "그리스",
          "우루과이",
          "일본",
          "중국",
          null,
        ],
      },
      region: { type: ["string", "null"] },
      type: {
        type: ["string", "null"],
        enum: [
          "red",
          "white",
          "sparkling",
          "rose",
          "dessert",
          "fortified",
          "other",
          null,
        ],
      },
    },
    required: ["producer", "name", "vintage", "country", "region", "type"],
  } as const;

  const parsed = await generateJson<ParsedWine>({
    prompt,
    inlineData: { data: base64Data, mimeType },
    imageDetail: "high",
    jsonSchema: { name: "parsed_wine", schema: parsedWineSchema, strict: true },
  });

  return NextResponse.json({ data: parsed });
}
