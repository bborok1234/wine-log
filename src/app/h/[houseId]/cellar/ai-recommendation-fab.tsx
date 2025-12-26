"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button, Select, TextArea } from "@/components/ui";

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
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [preferredType, setPreferredType] = useState<
    | "any"
    | "red"
    | "white"
    | "sparkling"
    | "rose"
    | "dessert"
    | "fortified"
    | "other"
  >("any");
  const [priceBand, setPriceBand] = useState<
    "any" | "lt50k" | "lt100k" | "gte100k"
  >("any");

  const typeOptions = [
    { value: "any", label: "아무거나" },
    { value: "red", label: "레드" },
    { value: "white", label: "화이트" },
    { value: "sparkling", label: "스파클링" },
    { value: "rose", label: "로제" },
    { value: "dessert", label: "디저트" },
    { value: "fortified", label: "주정강화" },
    { value: "other", label: "기타" },
  ] as const;
  const priceOptions = [
    { value: "any", label: "예산 제한 없음" },
    { value: "lt50k", label: "5만원 미만" },
    { value: "lt100k", label: "10만원 미만" },
    { value: "gte100k", label: "10만원 이상" },
  ] as const;

  const scrollRef = useRef<HTMLDivElement | null>(null);

  function resetToForm() {
    setRecs([]);
    setShowForm(true);
    setErrorMessage(null);
    setActiveIndex(0);
  }

  function handleScrollTo(index: number) {
    if (!scrollRef.current) return;
    const clamped = Math.max(0, Math.min(index, recs.length - 1));
    const child = scrollRef.current.children[clamped] as
      | HTMLElement
      | undefined;
    if (!child) return;
    child.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
    setActiveIndex(clamped);
  }

  function handleScrollActive() {
    const container = scrollRef.current;
    if (!container) return;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let nearest = 0;
    let minDist = Number.POSITIVE_INFINITY;
    Array.from(container.children).forEach((node, idx) => {
      const card = node as HTMLElement;
      const rect = card.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const cardCenter =
        rect.left - containerRect.left + rect.width / 2 + container.scrollLeft;
      const dist = Math.abs(cardCenter - containerCenter);
      if (dist < minDist) {
        minDist = dist;
        nearest = idx;
      }
    });
    setActiveIndex(nearest);
  }

  useEffect(() => {
    if (recs.length === 0) return;
    setActiveIndex(0);
    requestAnimationFrame(() => handleScrollTo(0));
  }, [recs]);

  async function handleRecommend(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setIsLoading(true);
    setRecs([]);
    setErrorMessage(null);
    setShowForm(false);
    try {
      const data = await postJson<Recommendation[]>("/api/ai/recommend", {
        houseId,
        note,
        preferredType,
        priceBand,
      });
      setRecs(data);
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
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in"
        onClick={() => setIsOpen(false)}
      >
        <div
          className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-scale-in border border-indigo-100/60 overflow-hidden max-h-[88vh] flex flex-col min-h-0 p-6 sm:p-7"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-5 right-5 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-stone-50 text-stone-400 hover:text-stone-700 shadow-md shadow-black/5 ring-1 ring-stone-200/60 transition-all"
            aria-label="닫기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>

          {/* Header */}
          {showForm ? (
            <div className="pt-1 pb-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl mb-3 shadow-lg shadow-indigo-200">
                ✨
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2">
                오늘 뭐 마시지?
              </h2>
              <p className="text-sm text-stone-500 leading-relaxed">
                곁들이는 음식이나 분위기를 알려주시면
                <br />딱 맞는 와인을 골라드릴게요
              </p>
              <div className="mt-5 h-px bg-gradient-to-r from-transparent via-stone-200/80 to-transparent" />
            </div>
          ) : (
            <div className="pt-1 pb-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-stone-800">
                  오늘 뭐 마시지?
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto pt-4 pb-2">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full animate-ping opacity-20" />
                  <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-3xl shadow-xl">
                    ✨
                  </div>
                </div>
                <p className="text-stone-600 text-sm font-medium">
                  추천을 만들고 있어요...
                </p>
              </div>
            ) : errorMessage ? (
              <div className="text-center py-10">
                <p className="text-rose-600 font-semibold">{errorMessage}</p>
              </div>
            ) : showForm ? (
              <div className="rounded-2xl bg-stone-50/70 border border-stone-200/70 shadow-sm p-4">
                <form className="space-y-4" onSubmit={handleRecommend}>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-stone-700">
                      오늘의 계획
                    </label>
                    <TextArea
                      placeholder="예: 오늘은 생선회와 같이 먹을 거예요"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      className="min-h-[76px] resize-none bg-white"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-stone-700">
                        와인 타입
                      </label>
                      <Select
                        value={preferredType}
                        onChange={(e) =>
                          setPreferredType(
                            e.target.value as
                              | "any"
                              | "red"
                              | "white"
                              | "sparkling"
                              | "rose"
                              | "dessert"
                              | "fortified"
                              | "other"
                          )
                        }
                        disabled={isLoading}
                        options={typeOptions.map((opt) => ({
                          value: opt.value,
                          label: opt.label,
                        }))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-stone-700">
                        예산대
                      </label>
                      <Select
                        value={priceBand}
                        onChange={(e) =>
                          setPriceBand(
                            e.target.value as
                              | "any"
                              | "lt50k"
                              | "lt100k"
                              | "gte100k"
                          )
                        }
                        disabled={isLoading}
                        options={priceOptions.map((opt) => ({
                          value: opt.value,
                          label: opt.label,
                        }))}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    loading={isLoading}
                    className="mt-5 h-12 text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200"
                  >
                    ✨ 추천 받기
                  </Button>
                </form>
              </div>
            ) : recs.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse" />
                    <span className="text-sm font-bold text-stone-700">
                      추천 결과
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-4 py-1 rounded-lg">
                      {activeIndex + 1} / {recs.length}
                    </span>
                    <div className="hidden md:flex items-center gap-1">
                      <button
                        type="button"
                        className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-stone-600 transition-colors"
                        onClick={() => handleScrollTo(activeIndex - 1)}
                        disabled={activeIndex === 0}
                      >
                        ◀︎
                      </button>
                      <button
                        type="button"
                        className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-stone-600 transition-colors"
                        onClick={() => handleScrollTo(activeIndex + 1)}
                        disabled={activeIndex >= recs.length - 1}
                      >
                        ▶︎
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 px-1"
                    style={{
                      scrollSnapType: "x mandatory",
                      WebkitOverflowScrolling: "touch",
                      scrollPadding: "0 16px",
                    }}
                    onScroll={handleScrollActive}
                  >
                    {recs.map((rec) => (
                      <div
                        key={rec.wineId}
                        className="w-full min-w-full max-w-full sm:min-w-[340px] sm:max-w-[400px] md:min-w-[380px] md:max-w-[440px] snap-center snap-always flex-shrink-0"
                        style={{
                          scrollSnapAlign: "center",
                          scrollSnapStop: "always",
                        }}
                      >
                        <div className="h-full bg-gradient-to-br from-white to-indigo-50/50 border border-indigo-100 rounded-2xl p-5 shadow-md">
                          {rec.wine ? (
                            <div className="mb-4 pb-4 border-indigo-100">
                              <div className="font-bold text-xl text-stone-900 leading-tight mb-1.5">
                                {rec.wine.producer}
                              </div>
                              <div className="text-stone-600 font-medium text-base mb-3">
                                {rec.wine.name}
                                {rec.wine.vintage ? ` ${rec.wine.vintage}` : ""}
                              </div>
                              <span className="inline-block px-3 py-1.5 text-black rounded-full text-xs font-bold shadow-sm border border-stone-200">
                                {(rec.wine.type ?? "other").toString()}
                              </span>
                            </div>
                          ) : null}
                          <div className="space-y-3 mb-4">
                            <div className="bg-white/90 p-4 rounded-xl border border-indigo-50 shadow-sm">
                              <div className="flex items-start gap-2 text-sm text-stone-700 leading-relaxed break-keep">
                                <span className="text-lg flex-shrink-0">
                                  💬
                                </span>
                                <span className="font-medium">
                                  {rec.reason}
                                </span>
                              </div>
                            </div>
                            <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-100/50">
                              <div className="flex items-start gap-2 text-sm text-stone-700 leading-relaxed break-keep">
                                <span className="text-lg flex-shrink-0">🍽</span>
                                <div>
                                  <span className="font-bold text-stone-900">
                                    곁들임 추천
                                  </span>
                                  <br />
                                  {rec.pairing}
                                </div>
                              </div>
                            </div>
                          </div>
                          <Link
                            href={`/h/${houseId}/wine/${rec.wineId}`}
                            onClick={() => setIsOpen(false)}
                            className="block text-center rounded-xl px-5 py-3.5 text-sm font-bold bg-gradient-to-r from-wine-700 to-wine-900 text-white shadow-lg hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all duration-200"
                          >
                            와인 보러 가기 →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-stone-500">
                  추천 조건을 입력하고 시작해 주세요.
                </p>
              </div>
            )}
          </div>

          {/* Footer (always visible) */}
          <div className="pt-4 border-t border-stone-200/70">
            {isLoading ? (
              <div className="h-12" />
            ) : showForm ? null : (
              <div className="flex gap-3 pb-[calc(4px+env(safe-area-inset-bottom))]">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={resetToForm}
                >
                  다시 입력하기
                </Button>
                <Button
                  type="button"
                  fullWidth
                  onClick={() => setIsOpen(false)}
                >
                  닫기
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [
    errorMessage,
    houseId,
    isLoading,
    isOpen,
    note,
    preferredType,
    recs,
    priceBand,
    priceOptions,
    typeOptions,
  ]);

  return (
    <>
      <div className="flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 bg-white rounded-full shadow-lg shadow-indigo-100 flex items-center justify-center text-indigo-500 hover:scale-110 hover:text-indigo-600 transition-all border border-indigo-50 group relative"
          title="오늘 뭐 마시지?"
        >
          <div className="absolute right-full mr-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
            오늘 뭐 마시지?
          </div>
          <span className="text-xl">
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
              "✨"
            )}
          </span>
        </button>

        <Link
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
        </Link>
      </div>

      {typeof document !== "undefined" && modal
        ? createPortal(modal, document.body)
        : modal}
    </>
  );
}
