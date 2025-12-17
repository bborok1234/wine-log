function getApiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  return key;
}

function getModel() {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
}

function isGpt5LikeModel(model: string) {
  const m = model.toLowerCase();
  return m.startsWith("gpt-5") || m.includes("gpt-5");
}

interface ResponsesApiContentItem {
  type: string;
}

interface ResponsesApiOutputTextItem extends ResponsesApiContentItem {
  type: "output_text";
  text: string;
}

interface ResponsesApiMessageItem {
  type: "message";
  content: Array<ResponsesApiContentItem>;
}

interface ResponsesApiResponse {
  output_text?: string;
  output?: Array<ResponsesApiMessageItem | { type: string }>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getOutputTextFromResponses(json: unknown) {
  if (!isRecord(json)) return null;

  const outputText = json.output_text;
  if (typeof outputText === "string" && outputText.trim())
    return outputText.trim();

  const output = json.output;
  if (!Array.isArray(output)) return null;

  for (const item of output) {
    if (!isRecord(item) || item.type !== "message") continue;
    const content = item.content;
    if (!Array.isArray(content)) continue;
    for (const c of content) {
      if (!isRecord(c) || c.type !== "output_text") continue;
      const t = (c as Partial<ResponsesApiOutputTextItem>).text;
      if (typeof t === "string" && t.trim()) return t.trim();
    }
  }

  return null;
}

export interface JsonSchemaFormat {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
}

async function callOpenAI(args: {
  prompt: string;
  inlineData?: { mimeType: string; data: string };
  imageDetail?: "low" | "high" | "auto";
  jsonSchema?: JsonSchemaFormat;
}) {
  const apiKey = getApiKey();
  const model = getModel();

  const input =
    args.inlineData == null
      ? [
          {
            role: "user",
            content: [{ type: "input_text", text: args.prompt }],
          },
        ]
      : [
          {
            role: "user",
            content: [
              { type: "input_text", text: args.prompt },
              {
                type: "input_image",
                image_url: `data:${args.inlineData.mimeType};base64,${args.inlineData.data}`,
                detail: args.imageDetail ?? "high",
              },
            ],
          },
        ];

  const textFormat =
    args.jsonSchema != null
      ? {
          type: "json_schema" as const,
          name: args.jsonSchema.name,
          schema: args.jsonSchema.schema,
          strict: args.jsonSchema.strict ?? true,
        }
      : ({ type: "json_object" as const } satisfies { type: "json_object" });

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input,
      max_output_tokens: 800,
      ...(isGpt5LikeModel(model) ? { reasoning: { effort: "minimal" } } : {}),
      text: {
        format: {
          ...textFormat,
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenAI API 오류: ${res.status} ${res.statusText} ${body}`);
  }

  const json = (await res.json()) as ResponsesApiResponse;
  const text = getOutputTextFromResponses(json);
  if (text) return text;

  throw new Error("OpenAI 응답에서 output_text를 찾지 못했습니다.");
}

export async function generateJson<T>(args: {
  prompt: string;
  inlineData?: { mimeType: string; data: string };
  imageDetail?: "low" | "high" | "auto";
  jsonSchema?: JsonSchemaFormat;
}) {
  const raw = await callOpenAI(args);
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`OpenAI JSON 파싱 실패: ${raw.slice(0, 200)}`);
  }
}
