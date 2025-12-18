"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Card, WineTypeBadge } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

type FilterMode = "in_stock" | "out_of_stock" | "all";
type SortMode =
  | "stock_desc"
  | "price_desc"
  | "price_asc"
  | "rating_desc"
  | "recent";
type TypeFilter =
  | "ALL"
  | "red"
  | "white"
  | "sparkling"
  | "rose"
  | "dessert"
  | "fortified"
  | "other";
interface PriceRange {
  min: number;
  max: number;
}

function formatPriceShortMan(value: number) {
  return `${Math.round(value / 10000)}만`;
}

function isPriceFilterAll(priceFilter: PriceRange, priceRange: PriceRange) {
  return (
    priceFilter.min === priceRange.min && priceFilter.max === priceRange.max
  );
}

function getPlaceholderImageUrl(type: string | null): string {
  const normalizedType = (type ?? "").toLowerCase();
  const validTypes = [
    "red",
    "white",
    "sparkling",
    "rose",
    "dessert",
    "fortified",
    "other",
  ];
  const typeKey = validTypes.includes(normalizedType)
    ? normalizedType
    : "other";
  return `/placehoder/${typeKey}.png`;
}

export interface CellarWine {
  id: string;
  producer: string;
  name: string | null;
  vintage: number | null;
  country: string | null;
  region: string | null;
  type: string | null;
  stockQty: number;
  avgPurchasePrice: number;
  rating: number | null;
  thumbnailUrl: string | null;
}

function formatPriceManWon(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "-";
  return `${(value / 10000).toFixed(1)}만`;
}

export function CellarListClient({
  houseId,
  initialSearch,
  wines,
  openBottleAction,
}: {
  houseId: string;
  initialSearch: string;
  wines: CellarWine[];
  openBottleAction: (formData: FormData) => void | Promise<void>;
}) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [stockFilter, setStockFilter] = useState<FilterMode>("in_stock");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [countryFilter, setCountryFilter] = useState<string>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("stock_desc");
  const [showPriceSlider, setShowPriceSlider] = useState(false);

  // 가격 범위 계산
  const priceRange = useMemo(() => {
    const prices = wines.map((w) => w.avgPurchasePrice).filter((p) => p > 0);
    if (prices.length === 0) return { min: 0, max: 500000 };
    const min = Math.floor(Math.min(...prices) / 10000) * 10000;
    const max = Math.ceil(Math.max(...prices) / 10000) * 10000;
    return { min, max: Math.max(max, 100000) };
  }, [wines]);

  const [selectedPriceFilter, setSelectedPriceFilter] =
    useState<PriceRange | null>(null);
  const priceFilter = useMemo(() => {
    const active = selectedPriceFilter ?? priceRange;
    const min = Math.max(priceRange.min, active.min);
    const max = Math.min(priceRange.max, active.max);
    return { min: Math.min(min, max), max: Math.max(min, max) };
  }, [priceRange, selectedPriceFilter]);

  function handlePreventSliderTrackClick(
    e: React.PointerEvent<HTMLSpanElement>
  ) {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('[data-slot="slider-thumb"]')) return;
    e.preventDefault();
    e.stopPropagation();
  }

  const [confirmingWine, setConfirmingWine] = useState<CellarWine | null>(null);
  const [showStats, setShowStats] = useState(false);

  async function handleOpenBottleAndClose(formData: FormData) {
    await openBottleAction(formData);
    setConfirmingWine(null);
  }

  const inStockWines = useMemo(
    () => wines.filter((w) => w.stockQty > 0),
    [wines]
  );
  const totalBottles = useMemo(
    () => inStockWines.reduce((acc, w) => acc + w.stockQty, 0),
    [inStockWines]
  );
  const totalValue = useMemo(
    () =>
      inStockWines.reduce((acc, w) => acc + w.stockQty * w.avgPurchasePrice, 0),
    [inStockWines]
  );

  const statsByType = useMemo(() => {
    const stats = { red: 0, white: 0, sparkling: 0, others: 0 };
    for (const w of inStockWines) {
      const t = (w.type ?? "").toLowerCase();
      if (t === "red") stats.red += w.stockQty;
      else if (t === "white") stats.white += w.stockQty;
      else if (t === "sparkling") stats.sparkling += w.stockQty;
      else stats.others += w.stockQty;
    }
    return stats;
  }, [inStockWines]);

  const statsByCountry = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const w of inStockWines) {
      const key = w.country?.trim() || "기타";
      counts[key] = (counts[key] ?? 0) + w.stockQty;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [inStockWines]);

  // 국가 목록 추출 (필터용)
  const countries = useMemo(() => {
    const countrySet = new Set<string>();
    wines.forEach((w) => {
      if (w.country?.trim()) {
        countrySet.add(w.country.trim());
      }
    });
    return Array.from(countrySet).sort();
  }, [wines]);

  const filteredWines = useMemo(() => {
    let result = wines;

    if (stockFilter === "in_stock")
      result = result.filter((w) => w.stockQty > 0);
    else if (stockFilter === "out_of_stock")
      result = result.filter((w) => w.stockQty === 0);

    if (typeFilter !== "ALL") {
      result = result.filter(
        (w) => (w.type ?? "").toLowerCase() === typeFilter.toLowerCase()
      );
    }

    if (countryFilter !== "ALL") {
      result = result.filter((w) => w.country?.trim() === countryFilter);
    }

    // 가격 범위 필터링
    result = result.filter((w) => {
      const price = w.avgPurchasePrice;
      if (price === 0) return false;
      return price >= priceFilter.min && price <= priceFilter.max;
    });

    if (searchTerm.trim()) {
      const lower = searchTerm.trim().toLowerCase();
      result = result.filter((w) => {
        const hay = [
          w.name ?? "",
          w.producer ?? "",
          w.region ?? "",
          w.country ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(lower);
      });
    }

    const sorted = [...result].sort((a, b) => {
      switch (sortMode) {
        case "price_desc":
          return (b.avgPurchasePrice ?? 0) - (a.avgPurchasePrice ?? 0);
        case "price_asc":
          return (a.avgPurchasePrice ?? 0) - (b.avgPurchasePrice ?? 0);
        case "rating_desc":
          return (b.rating ?? 0) - (a.rating ?? 0);
        case "recent":
          return 0; // 서버에서 정렬 정보를 안 들고오므로(디자인만 맞추기) 그대로 둠
        case "stock_desc":
        default:
          return (b.stockQty ?? 0) - (a.stockQty ?? 0);
      }
    });

    return sorted;
  }, [
    wines,
    searchTerm,
    stockFilter,
    typeFilter,
    countryFilter,
    priceFilter,
    sortMode,
  ]);

  return (
    <>
      <div className="px-5 pt-4 pb-2">
        {!searchTerm.trim() ? (
          <div className="bg-white/80 backdrop-blur rounded-[28px] p-6 border border-white/50 shadow-lg shadow-stone-200/50 mb-6 animate-fade-in-up relative overflow-hidden">
            <button
              type="button"
              onClick={() => setShowStats(true)}
              className="absolute top-4 right-4 text-[10px] font-bold bg-stone-100 text-stone-500 px-2 py-1 rounded-full hover:bg-stone-200 transition-colors flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3 h-3"
              >
                <path d="M15.5 2A1.5 1.5 0 0014 3.5v8a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-8A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v4a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-4A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v0A1.5 1.5 0 003.5 13h1a1.5 1.5 0 001.5-1.5v0A1.5 1.5 0 004.5 10h-1z" />
              </svg>
              분석 보기
            </button>

            <div className="flex justify-between items-end mb-5 border-b border-stone-100 pb-5">
              <div>
                <p className="text-[11px] text-stone-400 font-extrabold uppercase tracking-widest mb-1.5">
                  Total Value
                </p>
                <p className="text-3xl font-bold text-stone-800 tracking-tight">
                  {totalValue.toLocaleString()}
                  <span className="text-lg font-medium text-stone-400 ml-1">
                    원
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-stone-400 font-extrabold uppercase tracking-widest mb-1.5">
                  Bottles
                </p>
                <p className="text-3xl font-bold text-wine-600 tracking-tight">
                  {totalBottles}
                  <span className="text-lg font-medium text-wine-300 ml-1">
                    병
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-stone-500 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-wine-600 shadow-[0_0_8px_rgba(209,42,63,0.4)]" />
                Red {statsByType.red}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
                White {statsByType.white}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                Sparkling {statsByType.sparkling}
              </div>
            </div>
          </div>
        ) : null}

        <div className="relative mb-4">
          <input
            className="w-full pl-12 pr-4 py-4 bg-white/90 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-none text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-wine-50/50 transition-all text-sm font-medium"
            placeholder="이름, 지역, 생산자 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="w-5 h-5 text-stone-400 absolute left-4 top-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>

        <div className="space-y-2 mb-2">
          {/* 타입/국가/가격: 기존처럼 가로 나열(스크롤) */}
          <div className="flex items-end gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
            {/* 타입 */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              <span className="text-[10px] font-extrabold tracking-widest text-stone-400 px-1">
                타입
              </span>
              <div className="relative group">
                <Select
                  value={typeFilter}
                  onValueChange={(v) => setTypeFilter(v as TypeFilter)}
                >
                  <SelectTrigger
                    size="sm"
                    className={[
                      "rounded-full px-3 py-2 text-xs font-bold shadow-sm hover:shadow-md border transition-all",
                      "data-[size=sm]:h-auto",
                      typeFilter === "ALL"
                        ? "bg-white text-stone-700 border-stone-200"
                        : "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
                    ].join(" ")}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    <SelectItem value="red">레드</SelectItem>
                    <SelectItem value="white">화이트</SelectItem>
                    <SelectItem value="sparkling">스파클링</SelectItem>
                    <SelectItem value="rose">로제</SelectItem>
                    <SelectItem value="dessert">디저트</SelectItem>
                    <SelectItem value="fortified">주정강화</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 국가 */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              <span className="text-[10px] font-extrabold tracking-widest text-stone-400 px-1">
                국가
              </span>
              <div className="relative group">
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger
                    size="sm"
                    className={[
                      "rounded-full px-3 py-2 text-xs font-bold shadow-sm hover:shadow-md border transition-all",
                      "data-[size=sm]:h-auto",
                      countryFilter === "ALL"
                        ? "bg-white text-stone-700 border-stone-200"
                        : "bg-pink-50 text-pink-700 border-pink-200",
                    ].join(" ")}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 가격 */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              <span className="text-[10px] font-extrabold tracking-widest text-stone-400 px-1">
                가격
              </span>
              <button
                type="button"
                onClick={() => setShowPriceSlider(!showPriceSlider)}
                className={[
                  "px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border shadow-sm hover:shadow-md",
                  isPriceFilterAll(priceFilter, priceRange)
                    ? "bg-white text-stone-700 border-stone-200"
                    : "bg-rose-50 text-rose-700 border-rose-200",
                ].join(" ")}
              >
                {isPriceFilterAll(priceFilter, priceRange)
                  ? "전체"
                  : `${formatPriceShortMan(
                      priceFilter.min
                    )}~${formatPriceShortMan(priceFilter.max)}`}
              </button>
            </div>
          </div>

          {/* 가격 범위 슬라이더 (토글) */}
          {showPriceSlider ? (
            <div className="px-1 pb-2 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-600">가격대</span>
                <span className="text-xs font-bold text-stone-800">
                  {Math.round(priceFilter.min / 10000)}만원 ~{" "}
                  {Math.round(priceFilter.max / 10000)}만원
                </span>
              </div>
              <Slider
                min={priceRange.min}
                max={priceRange.max}
                step={10000}
                value={[priceFilter.min, priceFilter.max]}
                onValueChange={(values) => {
                  const [min, max] = values;
                  setSelectedPriceFilter({ min, max });
                }}
                onPointerDownCapture={handlePreventSliderTrackClick}
                className={[
                  "py-2",
                  // 색상/스타일 오버라이드 (shadcn Slider 내부 슬롯 선택)
                  "[&_[data-slot=slider-track]]:bg-stone-200",
                  "[&_[data-slot=slider-range]]:bg-wine-500",
                  "[&_[data-slot=slider-thumb]]:border-wine-500",
                  "[&_[data-slot=slider-thumb]]:size-5",
                ].join(" ")}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-5 flex items-center justify-between mb-4 border-t border-stone-200/40 pt-4">
        <div className="flex p-1 bg-stone-200/50 rounded-xl backdrop-blur-sm">
          {[
            { label: "보유 중", value: "in_stock" as const },
            { label: "전체", value: "all" as const },
            { label: "빈 병", value: "out_of_stock" as const },
          ].map((tab) => {
            const isActive = stockFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStockFilter(tab.value)}
                className={[
                  "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300",
                  isActive
                    ? "bg-white text-stone-800 shadow-sm"
                    : "text-stone-400 hover:text-stone-600",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative group">
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="appearance-none bg-transparent text-xs font-bold text-stone-500 text-right pr-4 focus:outline-none cursor-pointer hover:text-stone-800 transition-colors"
          >
            <option value="stock_desc">재고 많은 순</option>
            <option value="recent">최근 등록 순</option>
            <option value="price_desc">높은 가격 순</option>
            <option value="price_asc">낮은 가격 순</option>
            <option value="rating_desc">평점 높은 순</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-stone-400">
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="px-5 pb-24 space-y-4">
        {filteredWines.length === 0 ? (
          <div className="text-center py-20 px-6 animate-fade-in-up">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
              🤷‍♂️
            </div>
            <p className="text-stone-400 mb-2 font-medium">
              조건에 맞는 와인이 없어요.
            </p>
            {stockFilter === "in_stock" ? (
              <p className="text-sm text-stone-400">
                새로운 와인을 추가해보세요!
              </p>
            ) : null}
          </div>
        ) : (
          filteredWines.map((wine, index) => {
            const isOutOfStock = wine.stockQty === 0;
            const typeLower = (wine.type ?? "").toLowerCase();
            const accent =
              typeLower === "red"
                ? "bg-wine-500"
                : typeLower === "white"
                ? "bg-yellow-400"
                : typeLower === "sparkling"
                ? "bg-emerald-400"
                : "bg-stone-300";

            return (
              <div
                key={wine.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card
                  onClick={() => router.push(`/h/${houseId}/wine/${wine.id}`)}
                  className={[
                    "relative flex flex-col gap-3 group overflow-hidden",
                    isOutOfStock
                      ? "opacity-70 grayscale-[0.8] hover:opacity-100 hover:grayscale-0"
                      : "",
                  ].join(" ")}
                >
                  {!isOutOfStock ? (
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${accent} opacity-0 group-hover:opacity-100 transition-opacity`}
                    />
                  ) : null}

                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex-shrink-0 shadow-md group-hover:shadow-lg transition-all transform group-hover:scale-[1.02] overflow-hidden">
                      <Image
                        src={
                          wine.thumbnailUrl ?? getPlaceholderImageUrl(wine.type)
                        }
                        alt={wine.name ?? wine.producer}
                        fill
                        className="object-contain"
                        sizes="80px"
                        loading="eager"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-bold text-stone-900 text-[17px] leading-tight truncate tracking-tight">
                          {wine.producer}
                        </h3>
                        <span className="flex-shrink-0 text-sm font-extrabold text-stone-900">
                          {formatPriceManWon(wine.avgPurchasePrice)}
                        </span>
                      </div>

                      <div className="mt-0.5 flex items-baseline gap-2 min-w-0">
                        <p className="text-stone-600 text-[15px] font-medium truncate min-w-0">
                          {wine.name ?? "-"}
                        </p>
                        <span className="flex-shrink-0 text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                          {wine.vintage ? String(wine.vintage) : "NV"}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-xs font-bold min-w-0">
                        <WineTypeBadge type={wine.type} />
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                          {wine.country?.trim() || "국가 미상"}
                        </span>
                        {wine.region ? (
                          <span className="truncate text-[10px] text-stone-400 font-semibold min-w-0">
                            {wine.region}
                          </span>
                        ) : null}
                        {wine.rating ? (
                          <span className="ml-auto flex items-center gap-1 text-amber-500 flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-3.5 h-3.5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {Number(wine.rating).toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-2 flex-shrink-0">
                      <div
                        className={[
                          "w-12 h-12 rounded-full flex flex-col items-center justify-center shadow-sm border",
                          isOutOfStock
                            ? "bg-stone-50 text-stone-400 border-stone-100"
                            : "bg-wine-50 text-wine-700 border-wine-100",
                        ].join(" ")}
                      >
                        <span className="text-lg font-extrabold leading-none">
                          {wine.stockQty}
                        </span>
                        <span className="text-[9px] font-bold tracking-wider opacity-60">
                          병
                        </span>
                      </div>

                      {!isOutOfStock ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmingWine(wine);
                          }}
                          className="w-12 h-12 rounded-full bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 shadow-sm flex flex-col items-center justify-center transition-all active:scale-95"
                          title="1병 마시기"
                          aria-label="1병 마시기"
                        >
                          <span className="text-sm font-extrabold leading-none">
                            -1
                          </span>
                          <span className="text-[9px] font-bold text-stone-400 mt-1">
                            마시기
                          </span>
                        </button>
                      ) : (
                        <span className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-100 text-[10px] font-extrabold text-stone-400 flex items-center justify-center tracking-widest">
                          품절
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            );
          })
        )}
      </div>

      {confirmingWine ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-5 bg-stone-900/20 backdrop-blur-md animate-fade-in"
          onClick={() => setConfirmingWine(null)}
        >
          <div
            className="glass-card bg-white/90 rounded-[32px] p-6 w-full max-w-xs shadow-2xl animate-scale-in border border-white/60"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-wine-100 to-pink-100 text-wine-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
                🥂
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">
                한 병 마실까요?
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                <span className="font-bold text-stone-800 text-base">
                  {confirmingWine.producer}
                </span>
                <br />
                <span className="text-stone-500">{confirmingWine.name}</span>
                <br />
                <br />
                기분 좋은 한 잔 되세요!
                <br />
                <span className="text-xs text-stone-400">
                  (재고 1병이 차감됩니다)
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 w-full"
                onClick={() => setConfirmingWine(null)}
              >
                취소
              </button>

              <form action={handleOpenBottleAndClose} className="w-full">
                <input type="hidden" name="houseId" value={houseId} />
                <input type="hidden" name="wineId" value={confirmingWine.id} />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-bold bg-gradient-to-br from-wine-700 to-wine-900 text-white shadow-lg shadow-wine-200 hover:shadow-wine-300 hover:brightness-105 w-full"
                >
                  확인
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {showStats ? (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-5 bg-stone-900/30 backdrop-blur-md animate-fade-in"
          onClick={() => setShowStats(false)}
        >
          <div
            className="bg-white rounded-t-[32px] sm:rounded-[32px] p-6 w-full max-w-sm shadow-2xl animate-fade-in-up border-t sm:border border-white/80 max-h-[90vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-stone-900">
                내 와인 취향 분석
              </h2>
              <button
                type="button"
                onClick={() => setShowStats(false)}
                className="p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200"
                aria-label="닫기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                와인 종류 분포
              </h3>
              <div className="flex h-6 w-full rounded-full overflow-hidden bg-stone-100 mb-3">
                {(() => {
                  const parts = [
                    { key: "red", count: statsByType.red, bg: "bg-wine-600" },
                    {
                      key: "white",
                      count: statsByType.white,
                      bg: "bg-yellow-400",
                    },
                    {
                      key: "sparkling",
                      count: statsByType.sparkling,
                      bg: "bg-emerald-500",
                    },
                    {
                      key: "others",
                      count: statsByType.others,
                      bg: "bg-stone-300",
                    },
                  ];
                  return parts.map((p) => {
                    if (p.count === 0 || totalBottles === 0) return null;
                    const percent = (p.count / totalBottles) * 100;
                    return (
                      <div
                        key={p.key}
                        className={p.bg}
                        style={{ width: `${percent}%` }}
                      />
                    );
                  });
                })()}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {(() => {
                  const items = [
                    { label: "레드", count: statsByType.red },
                    { label: "화이트", count: statsByType.white },
                    { label: "스파클링", count: statsByType.sparkling },
                    { label: "기타", count: statsByType.others },
                  ];
                  return items.map((it) => {
                    if (it.count === 0 || totalBottles === 0) return null;
                    const percent = Math.round((it.count / totalBottles) * 100);
                    return (
                      <div
                        key={it.label}
                        className="flex justify-between items-center p-2 rounded-xl bg-stone-50"
                      >
                        <span className="text-stone-600 font-medium">
                          {it.label}
                        </span>
                        <span className="font-bold text-stone-900">
                          {percent}% ({it.count}병)
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                국가별 선호도
              </h3>
              <div className="space-y-3">
                {statsByCountry.map(([country, count]) => {
                  const percent = totalBottles
                    ? (count / totalBottles) * 100
                    : 0;
                  return (
                    <div key={country} className="relative">
                      <div className="flex justify-between text-sm mb-1 relative z-10">
                        <span className="font-medium text-stone-700">
                          {country || "국가 미상"}
                        </span>
                        <span className="font-bold text-stone-900">
                          {count}병
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-400 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
