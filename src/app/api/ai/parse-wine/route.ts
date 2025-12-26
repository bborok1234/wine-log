import { NextResponse } from "next/server";

import { generateJson } from "@/lib/ai/openai";
import { requireAuthedUser } from "@/lib/house";
import { createClient } from "@/lib/supabase/server";

interface ParseWineRequestBody {
  text?: string;
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

const SPARKLING_KEYWORDS = [
  "champagne",
  "crémant",
  "cremant",
  "cava",
  "prosecco",
  "schaumwein",
  "sparkling",
  "brut",
  "extra brut",
  "methode",
  "méthode",
  "champenoise",
  "traditional",
  "sekt",
  "frizzante",
  "spumante",
  "espumante",
  "bubbles",
];

const ROSE_KEYWORDS = ["rosé", "rose", "rosado", "rosato", "blush"];

function normalizeRegion(region: string | null): string | null {
  if (!region) return region;
  const lowered = region.toLowerCase();
  if (lowered.includes("champagne") || lowered.includes("샴페인")) return "상파뉴";
  return region;
}

function normalizeWineType(parsed: ParsedWine): ParsedWine {
  const text = [parsed.name, parsed.producer, parsed.region]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const hasSparkling = SPARKLING_KEYWORDS.some((k) => text.includes(k));
  const hasRose = ROSE_KEYWORDS.some((k) => text.includes(k));

  const nextType = hasSparkling
    ? "sparkling"
    : hasRose
    ? "rose"
    : parsed.type;

  return { ...parsed, type: nextType };
}

export async function POST(req: Request) {
  const supabase = await createClient();
  await requireAuthedUser(supabase);

  const body = (await req.json().catch(() => ({}))) as ParseWineRequestBody;
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text)
    return NextResponse.json({ error: "text가 필요합니다." }, { status: 400 });

  const prompt = [
    "너는 사용자가 입력한 짧은 와인 문자열에서 정보를 구조화하는 도우미야.",
    "반드시 **JSON만** 출력해. (마크다운/설명 금지)",
    "",
    `입력: "${text}"`,
    "",
    "규칙(정확도 최우선):",
    "- 절대 지어내지 마. 확실치 않으면 null.",
    "- producer: 생산자/와이너리/도멘/샤또 이름",
    "- name: cuvée/밭/클라이멧/상품명(있으면)",
    "- vintage: 4자리 연도면 number, 없으면 null",
    "- country: 국가명만(프랑스/이탈리아/미국/스페인/독일/칠레/아르헨티나/호주/뉴질랜드/남아공/포르투갈/오스트리아/헝가리/그리스/우루과이/일본/중국 중 하나). 모르면 null",
    "- region: 지역/AOC/산지(예: 부르고뉴, 토스카나, 나파 밸리 등). 모르면 null",
    "- 영어/프랑스어 표기가 있으면 가능하면 한국어로 표기(단, 고유명사는 원문을 최대한 유지)",
    "- type: red|white|sparkling|rose|dessert|fortified|other. 모르면 other 또는 null",
    "- Champagne/Crémant/Cava/Prosecco/Sekt/Frizzante/Spumante/Brut 등 스파클링 단어가 보이면 반드시 sparkling으로 분류.",
    "- Rosé/Rosado/Rosato/Blush 등 핑크 계열 단어가 보이면 rose로 분류.",
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
    jsonSchema: { name: "parsed_wine", schema: parsedWineSchema, strict: true },
  });
  const normalized = normalizeWineType({
    ...parsed,
    region: normalizeRegion(parsed.region),
  });
  return NextResponse.json({ data: normalized });
}
