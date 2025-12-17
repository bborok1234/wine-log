"use client";

import { useState } from "react";

interface SommelierAdvice {
  description: string;
  pairing: string;
  servingTemp: string;
  grapeVariety: string | null;
}

async function postJson<T>(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as unknown;
  const error =
    typeof json === "object" && json && "error" in json ? (json as { error?: unknown }).error : null;
  const data =
    typeof json === "object" && json && "data" in json ? (json as { data?: unknown }).data : null;
  if (!res.ok) throw new Error(typeof error === "string" ? error : "요청에 실패했어요.");
  return data as T;
}

export function AiSommelier({
  houseId,
  wineId,
}: {
  houseId: string;
  wineId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<SommelierAdvice | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleAsk() {
    setIsOpen(true);
    if (advice) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await postJson<SommelierAdvice>("/api/ai/sommelier", { houseId, wineId });
      setAdvice(data);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "AI 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleAsk}
          className={[
            "flex items-center justify-center w-14 h-14 rounded-full border shadow-lg active:scale-95 transition-all",
            advice
              ? "bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 border-indigo-100"
              : "bg-white text-stone-400 border-stone-100 hover:text-indigo-500",
          ].join(" ")}
          title="AI 소믈리에"
          aria-label="AI 소믈리에"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path
              fillRule="evenodd"
              d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen ? (
        <div className="mt-4 overflow-hidden relative rounded-[32px] animate-fade-in-up shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-[#EEF2FF] via-[#F5F3FF] to-[#FFF1F2]" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl" />

          <div className="relative p-6 border border-white/50">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                <span className="text-xl">✨</span> AI 소믈리에
                {isLoading ? (
                  <span className="text-xs font-normal text-indigo-400 animate-pulse ml-2">
                    분석 중...
                  </span>
                ) : null}
              </h4>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 bg-white/60 rounded-full text-stone-500 hover:bg-white transition-colors"
                aria-label="닫기"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-3 opacity-60">
                <div className="h-4 bg-indigo-200/50 rounded w-full animate-pulse" />
                <div className="h-4 bg-indigo-200/50 rounded w-2/3 animate-pulse" />
              </div>
            ) : errorMessage ? (
              <p className="text-sm text-rose-600 font-bold">{errorMessage}</p>
            ) : advice ? (
              <div className="text-sm text-indigo-900/80 space-y-5">
                <p className="italic font-medium text-lg leading-relaxed text-indigo-950">
                  &quot;{advice.description}&quot;
                </p>

                {advice.grapeVariety ? (
                  <div className="bg-white/60 p-4 rounded-2xl shadow-sm border border-white/40">
                    <span className="font-bold text-indigo-900 block text-[10px] uppercase tracking-wide mb-1 opacity-60">
                      🍇 주요 품종
                    </span>
                    {advice.grapeVariety}
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/60 p-4 rounded-2xl shadow-sm border border-white/40">
                    <span className="font-bold text-indigo-900 block text-[10px] uppercase tracking-wide mb-1 opacity-60">
                      🍽 추천 음식
                    </span>
                    {advice.pairing}
                  </div>
                  <div className="bg-white/60 p-4 rounded-2xl shadow-sm border border-white/40">
                    <span className="font-bold text-indigo-900 block text-[10px] uppercase tracking-wide mb-1 opacity-60">
                      🌡 서빙 온도
                    </span>
                    {advice.servingTemp}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}


