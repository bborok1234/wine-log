"use client";

import { useCallback, useState } from "react";

import type { SommelierAdvice } from "@/lib/sommelier-advice";

export type { SommelierAdvice } from "@/lib/sommelier-advice";

async function postJson<T>(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as unknown;
  const error =
    typeof json === "object" && json && "error" in json
      ? (json as { error?: unknown }).error
      : null;
  const data =
    typeof json === "object" && json && "data" in json
      ? (json as { data?: unknown }).data
      : null;
  if (!res.ok)
    throw new Error(typeof error === "string" ? error : "요청에 실패했어요.");
  return data as T;
}

export function useSommelierAdvice(
  houseId: string,
  wineId: string,
  initialAdvice: SommelierAdvice | null = null
) {
  const [isOpen, setIsOpen] = useState<boolean>(!!initialAdvice);
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<SommelierAdvice | null>(initialAdvice);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAdvice = useCallback(
    async (forceRefresh: boolean) => {
      setIsOpen(true);
      if (!forceRefresh && advice) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await postJson<SommelierAdvice>("/api/ai/sommelier", {
          houseId,
          wineId,
          forceRefresh: forceRefresh ? true : undefined,
        });
        setAdvice(data);
      } catch (e) {
        setErrorMessage(
          e instanceof Error ? e.message : "AI 연결에 실패했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [advice, houseId, wineId]
  );

  const handleAsk = useCallback(async () => {
    await fetchAdvice(false);
  }, [fetchAdvice]);

  const handleRefresh = useCallback(async () => {
    await fetchAdvice(true);
  }, [fetchAdvice]);

  return {
    isOpen,
    setIsOpen,
    isLoading,
    advice,
    errorMessage,
    handleAsk,
    handleRefresh,
  };
}

interface AiSommelierProps {
  houseId: string;
  wineId: string;
  className?: string;
  initialAdvice?: SommelierAdvice | null;
}

export function AiSommelier({
  houseId,
  wineId,
  className,
  initialAdvice = null,
}: AiSommelierProps) {
  const { isOpen, isLoading, advice, errorMessage, handleAsk, handleRefresh } =
    useSommelierAdvice(houseId, wineId, initialAdvice);

  const triggerClasses = [
    "flex items-center justify-center w-14 h-14 rounded-full border shadow-lg active:scale-95 transition-all",
    advice
      ? "bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 border-indigo-100"
      : "bg-white text-stone-400 border-stone-100 hover:text-indigo-500",
  ].join(" ");

  return (
    <div className={className}>
      {!advice ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              if (isLoading) return;
              void handleAsk();
            }}
            className={triggerClasses}
            title="AI 소믈리에"
            aria-label="AI 소믈리에"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg
                className="animate-spin w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      ) : null}

      {isOpen ? (
        <div className="mt-4 w-full overflow-hidden relative rounded-[32px] animate-fade-in-up shadow-lg">
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
                onClick={() => void handleRefresh()}
                className="p-2 bg-white/60 rounded-full text-stone-500 hover:bg-white transition-colors disabled:opacity-60"
                aria-label="새로 분석"
                disabled={isLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 7.172a4 4 0 015.656-5.656l.586.586a1 1 0 01-1.414 1.414l-.586-.586A2 2 0 104.586 8.586l1.12 1.12a1 1 0 01-1.414 1.414l-1.12-1.12a4 4 0 010-5.656zm13.656 5.656a4 4 0 01-5.656 5.656l-.586-.586a1 1 0 111.414-1.414l.586.586A2 2 0 1015.414 11.4l-1.12-1.12a1 1 0 111.414-1.414l1.12 1.12a4 4 0 010 5.656z"
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
