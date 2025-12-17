function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY가 설정되어 있지 않습니다.");
  return apiKey;
}

function getGeminiModel() {
  return process.env.GEMINI_MODEL || "gemini-1.5-flash";
}

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

async function callGeminiGenerateContent(args: {
  prompt: string;
  inlineData?: { mimeType: string; data: string };
}) {
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const parts: Array<Record<string, unknown>> = [{ text: args.prompt }];
  if (args.inlineData)
    parts.unshift({
      inlineData: {
        mimeType: args.inlineData.mimeType,
        data: args.inlineData.data,
      },
    });

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.35,
        topP: 0.9,
        maxOutputTokens: 800,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini API 오류: ${res.status} ${res.statusText} ${body}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text =
    json.candidates?.[0]?.content?.parts
      ?.map((p) => (typeof p.text === "string" ? p.text : ""))
      .join("\n")
      .trim() ?? "";

  return text;
}

export async function generateJson<T>(args: {
  prompt: string;
  inlineData?: { mimeType: string; data: string };
}) {
  const raw = await callGeminiGenerateContent(args);
  const jsonText = extractJsonObject(raw);
  if (!jsonText)
    throw new Error(
      `Gemini 응답에서 JSON을 찾지 못했습니다: ${raw.slice(0, 200)}`
    );

  try {
    return JSON.parse(jsonText) as T;
  } catch {
    throw new Error(`Gemini JSON 파싱 실패: ${jsonText.slice(0, 200)}`);
  }
}
