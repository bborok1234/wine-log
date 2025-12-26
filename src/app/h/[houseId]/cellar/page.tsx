import { Layout } from "@/components/layout";
import { getFlash } from "@/lib/flash";
import { requireAuthedUser, requireHouseAccess } from "@/lib/house";
import { resolveWineImageUrls } from "@/lib/storage-image";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

import { openBottle, restoreBottle } from "./actions";
import { AiRecommendationFab } from "./ai-recommendation-fab";
import { CellarListClient } from "./cellar-list-client";

function normalizeSort(value: unknown) {
  if (value === "stock_desc") return "stock_desc";
  if (value === "purchase_desc") return "purchase_desc";
  if (value === "purchase_asc") return "purchase_asc";
  if (value === "price_desc") return "price_desc";
  if (value === "price_asc") return "price_asc";
  if (value === "rating_desc") return "rating_desc";
  if (value === "vintage_asc") return "vintage_asc";
  if (value === "vintage_desc") return "vintage_desc";
  // legacy: removed "recent" (created_at desc) → map to purchase_desc
  if (value === "recent") return "purchase_desc";
  return "purchase_desc";
}

function normalizeStock(value: unknown) {
  if (value === "in_stock") return "in_stock";
  if (value === "out_of_stock") return "out_of_stock";
  if (value === "all") return "all";
  return "in_stock";
}

function normalizeType(value: unknown) {
  if (typeof value !== "string") return "ALL";
  const v = value.toLowerCase();
  if (v === "all") return "ALL";
  if (v === "red") return "red";
  if (v === "white") return "white";
  if (v === "sparkling") return "sparkling";
  if (v === "rose") return "rose";
  if (v === "dessert") return "dessert";
  if (v === "fortified") return "fortified";
  if (v === "other") return "other";
  return "ALL";
}

export default async function CellarPage({
  params,
  searchParams,
}: {
  params: Promise<{ houseId: string }>;
  searchParams?: Promise<{
    q?: string;
    stock?: string;
    type?: string;
    country?: string;
    sort?: string;
    priceMin?: string;
    priceMax?: string;
  }>;
}) {
  const { houseId } = await params;
  const sp = searchParams ? await searchParams : {};
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const stock = normalizeStock(sp.stock);
  const type = normalizeType(sp.type);
  const country = typeof sp.country === "string" ? sp.country.trim() : "";
  const sort = normalizeSort(sp.sort);
  const priceMin = Number(typeof sp.priceMin === "string" ? sp.priceMin : "");
  const priceMax = Number(typeof sp.priceMax === "string" ? sp.priceMax : "");
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

  if (stock === "in_stock") wineQuery = wineQuery.gt("stock_qty", 0);
  else if (stock === "out_of_stock") wineQuery = wineQuery.eq("stock_qty", 0);
  if (type !== "ALL") wineQuery = wineQuery.eq("type", type);
  if (country) wineQuery = wineQuery.eq("country", country);
  if (Number.isFinite(priceMin) && priceMin > 0)
    wineQuery = wineQuery.gte("avg_purchase_price", priceMin);
  if (Number.isFinite(priceMax) && priceMax > 0)
    wineQuery = wineQuery.lte("avg_purchase_price", priceMax);
  if (q) {
    const escaped = q.replaceAll(",", "\\,");
    wineQuery = wineQuery.or(
      `producer.ilike.%${escaped}%,name.ilike.%${escaped}%,region.ilike.%${escaped}%,country.ilike.%${escaped}%`
    );
  }
  if (sort === "purchase_desc") {
    wineQuery = wineQuery
      .order("last_purchased_at", { ascending: false, nullsFirst: false })
      .order("id", { ascending: false });
  } else if (sort === "purchase_asc") {
    wineQuery = wineQuery
      .order("last_purchased_at", { ascending: true, nullsFirst: false })
      .order("id", { ascending: false });
  } else if (sort === "price_desc") {
    wineQuery = wineQuery
      .order("avg_purchase_price", { ascending: false })
      .order("id", { ascending: false });
  } else if (sort === "price_asc") {
    wineQuery = wineQuery
      .order("avg_purchase_price", { ascending: true })
      .order("id", { ascending: true });
  } else if (sort === "rating_desc") {
    wineQuery = wineQuery
      .order("rating", { ascending: false, nullsFirst: false })
      .order("id", { ascending: false });
  } else if (sort === "vintage_asc") {
    wineQuery = wineQuery
      .order("vintage", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true });
  } else if (sort === "vintage_desc") {
    wineQuery = wineQuery
      .order("vintage", { ascending: false, nullsFirst: false })
      .order("id", { ascending: false });
  } else {
    wineQuery = wineQuery
      .order("stock_qty", { ascending: false })
      .order("id", { ascending: false });
  }

  const pageSize = 20;
  const wines = await wineQuery.range(0, pageSize); // fetch pageSize+1
  const winesData = wines.data ?? [];
  const pageRows = winesData.slice(0, pageSize);
  const hasMore = winesData.length > pageSize;
  const signedThumbs = await resolveWineImageUrls(
    supabase,
    pageRows.map((w) => w.label_photo_urls?.[0] ?? null)
  );

  const cellarWines = pageRows.map((w, idx) => ({
    id: w.id,
    producer: w.producer,
    name: w.name,
    vintage: w.vintage,
    country: w.country,
    region: w.region,
    type: w.type,
    stockQty: w.stock_qty ?? 0,
    avgPurchasePrice: Math.round(Number(w.avg_purchase_price ?? 0)),
    rating: w.rating,
    thumbnailUrl: signedThumbs[idx] ?? null,
  }));

  const stats = await (supabase as any).rpc("rpc_cellar_stats", {
    p_house_id: houseId,
    // 대시보드 통계는 "하우스 전체 요약" (필터 무관)
    p_q: null,
    p_stock: "all",
    p_consumed_only: false,
    p_type: null,
    p_country: null,
    p_price_min: null,
    p_price_max: null,
  });

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
          <Link
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
          </Link>
        </div>
      }
      floatingActionButton={<AiRecommendationFab houseId={houseId} q={q} />}
    >
      {flash?.kind === "error" ? (
        <div className="px-5 pt-4">
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {flash.message}
          </div>
        </div>
      ) : null}

      <CellarListClient
        houseId={houseId}
        initialPage={{
          wines: cellarWines,
          nextCursor: hasMore
            ? Buffer.from(
                JSON.stringify({ offset: pageSize }),
                "utf8"
              ).toString("base64url")
            : null,
          hasMore,
          stats: stats.data ?? null,
        }}
        openBottleAction={openBottle}
        restoreBottleAction={restoreBottle}
      />
    </Layout>
  );
}
