import { Layout } from "@/components/layout";
import { Card, WineTypeBadge } from "@/components/ui";
import { getFlash } from "@/lib/flash";
import { requireAuthedUser, requireHouseAccess } from "@/lib/house";
import { createClient } from "@/lib/supabase/server";

import { openBottle } from "./actions";
import { AiRecommendationFab } from "./ai-recommendation-fab";

export default async function CellarPage({
  params,
  searchParams,
}: {
  params: Promise<{ houseId: string }>;
  searchParams?: Promise<{
    q?: string;
    stock?: "in_stock" | "out_of_stock" | "all";
    type?: string;
    sort?: "stock_desc" | "recent" | "price_desc" | "price_asc" | "rating_desc";
  }>;
}) {
  const { houseId } = await params;
  const sp = await Promise.resolve(searchParams ?? {});
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const stockFilter = sp.stock ?? "in_stock";
  const typeFilter = typeof sp.type === "string" ? sp.type.trim() : "ALL";
  const sortMode = sp.sort ?? "stock_desc";
  const flash = await getFlash();

  const supabase = await createClient();
  await requireAuthedUser(supabase);
  const house = await requireHouseAccess(supabase, houseId);

  let wineQuery = supabase
    .from("wines")
    .select(
      "id,producer,name,vintage,country,region,type,stock_qty,avg_purchase_price,rating,label_photo_urls,created_at"
    )
    .eq("house_id", houseId);

  if (stockFilter === "in_stock") wineQuery = wineQuery.gt("stock_qty", 0);
  if (stockFilter === "out_of_stock") wineQuery = wineQuery.eq("stock_qty", 0);

  if (typeFilter && typeFilter !== "ALL") {
    const lower = typeFilter.toLowerCase();
    if (lower === "daily")
      wineQuery = wineQuery.lte("avg_purchase_price", 30000);
    else if (lower === "premium")
      wineQuery = wineQuery.gte("avg_purchase_price", 100000);
    else wineQuery = wineQuery.eq("type", typeFilter);
  }

  if (q) {
    const escaped = q.replaceAll(",", "\\,");
    wineQuery = wineQuery.or(
      `producer.ilike.%${escaped}%,name.ilike.%${escaped}%,region.ilike.%${escaped}%,country.ilike.%${escaped}%`
    );
  }

  if (sortMode === "recent")
    wineQuery = wineQuery.order("created_at", { ascending: false });
  else if (sortMode === "price_desc")
    wineQuery = wineQuery.order("avg_purchase_price", { ascending: false });
  else if (sortMode === "price_asc")
    wineQuery = wineQuery.order("avg_purchase_price", { ascending: true });
  else if (sortMode === "rating_desc")
    wineQuery = wineQuery.order("rating", { ascending: false });
  else wineQuery = wineQuery.order("stock_qty", { ascending: false });

  wineQuery = wineQuery
    .order("producer", { ascending: true })
    .order("name", { ascending: true });

  const wines = await wineQuery;

  const inStock = wines.data?.filter((w) => (w.stock_qty ?? 0) > 0) ?? [];
  const totalBottles = inStock.reduce((acc, w) => acc + (w.stock_qty ?? 0), 0);
  const totalValue = inStock.reduce(
    (acc, w) =>
      acc + (w.stock_qty ?? 0) * Math.round(w.avg_purchase_price ?? 0),
    0
  );

  const statsByType = inStock.reduce(
    (acc, w) => {
      const t = (w.type ?? "").toLowerCase();
      if (t === "red") acc.red += w.stock_qty ?? 0;
      else if (t === "white") acc.white += w.stock_qty ?? 0;
      else if (t === "sparkling") acc.sparkling += w.stock_qty ?? 0;
      else acc.others += w.stock_qty ?? 0;
      return acc;
    },
    { red: 0, white: 0, sparkling: 0, others: 0 }
  );

  return (
    <Layout
      backHref="/app"
      title={
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 font-extrabold mb-0.5">
            Cellar
          </span>
          <span className="text-xl font-serif text-stone-800">
            {house.name ?? "셀러"}
          </span>
        </div>
      }
      actions={
        <div className="flex items-center gap-2">
          <a
            href={`/h/${houseId}/settings`}
            className="p-2.5 rounded-full hover:bg-stone-100 transition-colors text-stone-400"
            title="설정"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </a>
        </div>
      }
      floatingActionButton={<AiRecommendationFab houseId={houseId} q={q} />}
    >
      <div className="px-5 pt-4 pb-2">
        {flash?.kind === "error" ? (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {flash.message}
          </div>
        ) : null}

        {!q ? (
          <div className="bg-white/80 backdrop-blur rounded-[28px] p-6 border border-white/50 shadow-lg shadow-stone-200/50 mb-6 animate-fade-in-up relative overflow-hidden">
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

        <form
          className="relative mb-4"
          action={`/h/${houseId}/cellar`}
          method="get"
        >
          <input type="hidden" name="stock" value={stockFilter} />
          <input type="hidden" name="type" value={typeFilter} />
          <input type="hidden" name="sort" value={sortMode} />
          <input
            className="w-full pl-12 pr-4 py-4 bg-white/90 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-none text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-wine-50/50 transition-all text-sm font-medium"
            placeholder="이름, 지역, 생산자 검색..."
            name="q"
            defaultValue={q}
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
        </form>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 mb-2 px-1">
          {[
            {
              label: "전체",
              value: "ALL",
              className: "bg-stone-800 text-white border-stone-800",
            },
            {
              label: "레드",
              value: "red",
              className: "bg-wine-100 text-wine-800 border-wine-200",
            },
            {
              label: "화이트",
              value: "white",
              className: "bg-yellow-100 text-yellow-800 border-yellow-200",
            },
            {
              label: "스파클링",
              value: "sparkling",
              className: "bg-emerald-100 text-emerald-800 border-emerald-200",
            },
            {
              label: "데일리",
              value: "daily",
              className: "bg-indigo-100 text-indigo-800 border-indigo-200",
            },
            {
              label: "프리미엄",
              value: "premium",
              className: "bg-purple-100 text-purple-800 border-purple-200",
            },
          ].map((chip) => {
            const isActive =
              typeFilter.toLowerCase() === chip.value.toLowerCase();
            const href =
              `/h/${houseId}/cellar?` +
              new URLSearchParams({
                q,
                stock: stockFilter,
                type: chip.value,
                sort: sortMode,
              }).toString();
            return (
              <a
                key={chip.value}
                href={href}
                className={[
                  "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border",
                  isActive
                    ? `${chip.className} shadow-md transform scale-105`
                    : "bg-white text-stone-500 border-transparent shadow-sm",
                ].join(" ")}
              >
                {chip.label}
              </a>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-4 border-t border-stone-200/40 pt-4">
          <div className="flex p-1 bg-stone-200/50 rounded-xl backdrop-blur-sm">
            {[
              { label: "보유 중", value: "in_stock" },
              { label: "전체", value: "all" },
              { label: "빈 병", value: "out_of_stock" },
            ].map((tab) => {
              const isActive = stockFilter === tab.value;
              const href =
                `/h/${houseId}/cellar?` +
                new URLSearchParams({
                  q,
                  stock: tab.value,
                  type: typeFilter,
                  sort: sortMode,
                }).toString();
              return (
                <a
                  key={tab.value}
                  href={href}
                  className={[
                    "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300",
                    isActive
                      ? "bg-white text-stone-800 shadow-sm"
                      : "text-stone-400 hover:text-stone-600",
                  ].join(" ")}
                >
                  {tab.label}
                </a>
              );
            })}
          </div>

          <form
            className="relative group flex items-center gap-2"
            action={`/h/${houseId}/cellar`}
            method="get"
          >
            <input type="hidden" name="q" value={q} />
            <input type="hidden" name="stock" value={stockFilter} />
            <input type="hidden" name="type" value={typeFilter} />
            <div className="relative">
              <select
                name="sort"
                defaultValue={sortMode}
                className="appearance-none bg-transparent text-xs font-bold text-stone-500 text-right pr-4 focus:outline-none cursor-pointer hover:text-stone-800 transition-colors"
                aria-label="정렬"
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
                  />
                </svg>
              </div>
            </div>
            <button
              type="submit"
              className="text-[10px] font-bold bg-stone-100 text-stone-500 px-2 py-1 rounded-full hover:bg-stone-200 transition-colors"
            >
              적용
            </button>
          </form>
        </div>

        <div className="space-y-4 pb-24">
          {wines.error ? (
            <Card className="animate-fade-in-up">
              <div className="text-sm text-red-600">{wines.error.message}</div>
            </Card>
          ) : wines.data?.length ? (
            wines.data.map((wine, index) => {
              const isOutOfStock = wine.stock_qty === 0;
              const thumbnail = wine.label_photo_urls?.[0] ?? null;
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
                  style={{ animationDelay: `${index * 35}ms` }}
                >
                  <Card
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

                    <a
                      href={`/h/${houseId}/wine/${wine.id}`}
                      className="flex justify-between items-start gap-4"
                    >
                      {thumbnail ? (
                        <div
                          className="w-20 h-24 rounded-2xl bg-stone-200 bg-cover bg-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-all transform group-hover:scale-[1.02]"
                          style={{ backgroundImage: `url(${thumbnail})` }}
                        />
                      ) : (
                        <div className="w-20 h-24 rounded-2xl bg-stone-100 flex items-center justify-center flex-shrink-0 text-3xl border border-stone-100/50 shadow-inner">
                          🍷
                        </div>
                      )}

                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-stone-900 text-[17px] leading-tight truncate tracking-tight">
                            {wine.producer}
                          </h3>
                        </div>
                        <p className="text-stone-600 text-[15px] font-medium truncate mb-2.5">
                          {wine.name}{" "}
                          <span className="text-stone-400 font-normal ml-0.5">
                            {wine.vintage
                              ? `'${String(wine.vintage).slice(-2)}`
                              : ""}
                          </span>
                        </p>

                        <div className="flex items-center gap-2 mb-2.5">
                          <WineTypeBadge type={wine.type} />
                          {wine.region ? (
                            <span className="truncate max-w-[100px] text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-bold">
                              {wine.region}
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-stone-500 font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-stone-300" />
                            {wine.avg_purchase_price &&
                            wine.avg_purchase_price > 0
                              ? `${(
                                  Number(wine.avg_purchase_price) / 10000
                                ).toFixed(1)}만`
                              : "-"}
                          </span>
                          {wine.rating ? (
                            <span className="flex items-center gap-1 text-amber-500">
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

                      <div className="flex flex-col items-end gap-2.5 mt-0.5">
                        <div
                          className={[
                            "flex flex-col items-center justify-center min-w-[2.8rem] py-1 rounded-2xl shadow-sm",
                            isOutOfStock
                              ? "bg-stone-100 text-stone-400"
                              : "bg-wine-50 text-wine-700",
                          ].join(" ")}
                        >
                          <span className="text-lg font-extrabold leading-none">
                            {wine.stock_qty}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">
                            EA
                          </span>
                        </div>

                        {!isOutOfStock ? (
                          <form>
                            <input
                              type="hidden"
                              name="houseId"
                              value={houseId}
                            />
                            <input
                              type="hidden"
                              name="wineId"
                              value={wine.id}
                            />
                            <button
                              formAction={openBottle}
                              className="w-10 h-10 rounded-full bg-white border border-wine-100 text-wine-400 hover:bg-wine-50 hover:text-wine-600 hover:border-wine-200 shadow-sm flex items-center justify-center transition-all active:scale-90"
                              title="1병 마시기"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-5 h-5"
                              >
                                <path d="M7.5 2c-1.79 1.15-3 3.18-3 5.5s1.21 4.35 3.03 5.5C4.46 13 2 10.54 2 7.5A5.5 5.5 0 017.5 2zM19.07 3.5a.75.75 0 10-1.14 1 5.5 5.5 0 00-1.43 3c0 3.15 1.64 5.82 4.05 7.23 1.63-.64 2.95-1.92 3.75-3.48A6.48 6.48 0 0119.07 3.5zM10.5 17.96V19.5H13v-1.54c2.81-.38 5-2.76 5-5.69 0-3.32-2.91-6.02-6.5-6.02S5 9.17 5 12.27c0 2.93 2.19 5.31 5 5.69z" />
                              </svg>
                            </button>
                          </form>
                        ) : (
                          <span className="px-2 py-1 rounded-md bg-stone-100 text-[9px] font-extrabold text-stone-400 uppercase tracking-widest">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </a>
                  </Card>
                </div>
              );
            })
          ) : (
            <Card className="animate-fade-in-up">
              <div className="text-sm text-stone-500 font-medium">
                아직 와인이 없어요. “구매 추가”로 첫 기록을 남겨보세요.
              </div>
              <div className="mt-4">
                <a href={`/h/${houseId}/purchase/new`}>
                  <span className="inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-bold bg-gradient-to-br from-wine-700 to-wine-900 text-white shadow-lg shadow-wine-200 hover:shadow-wine-300 hover:brightness-105 w-full">
                    구매 추가
                  </span>
                </a>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
