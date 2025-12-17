"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

interface Recommendation {
  wineId: string;
  reason: string;
  pairing: string;
  wine: {
    id: string;
    producer: string;
    name: string | null;
    vintage: number | null;
    type: string | null;
    region: string | null;
    country: string | null;
  } | null;
}

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

export function AiRecommendationFab({
  houseId,
  q,
}: {
  houseId: string;
  q: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleRecommend() {
    setIsOpen(true);
    setIsLoading(true);
    setRec(null);
    setErrorMessage(null);
    try {
      const data = await postJson<Recommendation>("/api/ai/recommend", {
        houseId,
      });
      setRec(data);
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : "AI 연결에 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const modal = useMemo(() => {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-5 bg-indigo-900/30 backdrop-blur-md animate-fade-in"
        onClick={() => setIsOpen(false)}
      >
        <div
          className="glass-card bg-white/95 rounded-[32px] p-6 w-full max-w-sm shadow-2xl animate-scale-in border border-white/80 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75" />
                <div className="relative w-full h-full bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center text-4xl shadow-inner">
                  ✨
                </div>
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">
                AI 소믈리에가 고민 중...
              </h3>
              <p className="text-stone-500 text-sm">
                보유하신 와인 중에서
                <br />
                오늘 가장 완벽한 한 병을 고르고 있어요.
              </p>
            </div>
          ) : errorMessage ? (
            <div className="text-center py-10">
              <div className="text-sm text-rose-600 font-bold">
                {errorMessage}
              </div>
            </div>
          ) : rec ? (
            <>
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl pointer-events-none">
                🍷
              </div>
              <h3 className="text-xs font-extrabold text-indigo-500 uppercase tracking-widest mb-1 text-center">
                Today&apos;s Pick
              </h3>
              <h2 className="text-2xl font-serif font-bold text-stone-900 text-center mb-6">
                오늘의 추천 와인
              </h2>

              {rec.wine ? (
                <div className="bg-indigo-50/50 p-4 rounded-2xl mb-6 border border-indigo-100 text-center">
                  <div className="font-bold text-lg text-stone-800 leading-tight mb-1">
                    {rec.wine.producer}
                  </div>
                  <div className="text-stone-600 font-medium mb-3">
                    {rec.wine.name}
                    {rec.wine.vintage ? ` ${rec.wine.vintage}` : ""}
                  </div>
                  <div className="inline-block px-3 py-1 bg-white rounded-full text-xs font-bold text-indigo-600 shadow-sm border border-indigo-50">
                    {(rec.wine.type ?? "other").toString()}
                  </div>
                </div>
              ) : null}

              <div className="space-y-4 mb-8">
                <div className="text-sm text-stone-700 leading-relaxed">
                  <span className="text-lg mr-2">💬</span>
                  &quot;{rec.reason}&quot;
                </div>
                <div className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl">
                  <span className="font-bold text-stone-900 mr-2">
                    🍽 곁들임 추천:
                  </span>
                  {rec.pairing}
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-bold bg-gradient-to-br from-wine-700 to-wine-900 text-white shadow-lg shadow-wine-200 hover:shadow-wine-300 hover:brightness-105 w-full"
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = `/h/${houseId}/wine/${rec.wineId}`;
                }}
              >
                보러 가기
              </button>
            </>
          ) : null}
        </div>
      </div>
    );
  }, [errorMessage, houseId, isLoading, isOpen, rec]);

  return (
    <>
      <div className="flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={handleRecommend}
          className="w-12 h-12 bg-white rounded-full shadow-lg shadow-indigo-100 flex items-center justify-center text-indigo-500 hover:scale-110 hover:text-indigo-600 transition-all border border-indigo-50 group relative"
          title="오늘 뭐 마시지?"
        >
          <div className="absolute right-full mr-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
            오늘 뭐 마시지?
          </div>
          <span className="text-xl">✨</span>
        </button>

        <a
          href={`/h/${houseId}/purchase/new?q=${encodeURIComponent(q)}`}
          className="w-16 h-16 bg-gradient-to-br from-wine-600 to-wine-800 rounded-full shadow-xl shadow-wine-200 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all group relative overflow-hidden"
          title="구매 추가"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8 relative z-10"
          >
            <path
              fillRule="evenodd"
              d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>

      {typeof document !== "undefined" && modal
        ? createPortal(modal, document.body)
        : modal}
    </>
  );
}
