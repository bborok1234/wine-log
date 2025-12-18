import { NextResponse } from "next/server";

import { requireAuthedUser, requireHouseAccess } from "@/lib/house";
import { resolveWineImageUrls } from "@/lib/storage-image";
import { createClient } from "@/lib/supabase/server";

function clampInt(value: number, { min, max }: { min: number; max: number }) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

function decodeCursor(cursor: string | null) {
  if (!cursor) return { offset: 0 };
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const parsed = JSON.parse(raw) as { offset?: number };
    const offset = Number(parsed.offset ?? 0);
    return {
      offset: Number.isFinite(offset) && offset >= 0 ? Math.trunc(offset) : 0,
    };
  } catch {
    return { offset: 0 };
  }
}

function encodeCursor(offset: number) {
  return Buffer.from(JSON.stringify({ offset }), "utf8").toString("base64url");
}

function normalizeSort(value: string | null) {
  if (value === "stock_desc") return "stock_desc";
  if (value === "purchase_desc") return "purchase_desc";
  if (value === "purchase_asc") return "purchase_asc";
  if (value === "price_desc") return "price_desc";
  if (value === "price_asc") return "price_asc";
  if (value === "rating_desc") return "rating_desc";
  if (value === "vintage_asc") return "vintage_asc";
  if (value === "vintage_desc") return "vintage_desc";
  return "stock_desc";
}

function normalizeStock(value: string | null) {
  if (value === "in_stock") return "in_stock";
  if (value === "out_of_stock") return "out_of_stock";
  if (value === "all") return "all";
  return "in_stock";
}

function normalizeType(value: string | null) {
  if (!value) return "ALL";
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

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ houseId: string }>;
  }
) {
  const { houseId } = await params;
  const url = new URL(req.url);

  const limit = clampInt(Number(url.searchParams.get("limit") ?? 20), {
    min: 1,
    max: 50,
  });
  const { offset } = decodeCursor(url.searchParams.get("cursor"));
  const includeStats = url.searchParams.get("includeStats") === "1";

  const q = (url.searchParams.get("q") ?? "").trim();
  const stock = normalizeStock(url.searchParams.get("stock"));
  const type = normalizeType(url.searchParams.get("type"));
  const country = (url.searchParams.get("country") ?? "").trim();
  const sort = normalizeSort(url.searchParams.get("sort"));
  const priceMin = Number(url.searchParams.get("priceMin") ?? "");
  const priceMax = Number(url.searchParams.get("priceMax") ?? "");

  const supabase = await createClient();
  await requireAuthedUser(supabase);
  await requireHouseAccess(supabase, houseId);

  let query = supabase
    .from("wines")
    .select(
      "id,producer,name,vintage,country,region,type,stock_qty,avg_purchase_price,rating,label_photo_urls,created_at"
    )
    .eq("house_id", houseId);

  if (stock === "in_stock") query = query.gt("stock_qty", 0);
  else if (stock === "out_of_stock") query = query.eq("stock_qty", 0);

  if (type !== "ALL") query = query.eq("type", type);
  if (country) query = query.eq("country", country);

  if (Number.isFinite(priceMin) && priceMin > 0)
    query = query.gte("avg_purchase_price", priceMin);
  if (Number.isFinite(priceMax) && priceMax > 0)
    query = query.lte("avg_purchase_price", priceMax);

  if (q) {
    const escaped = q.replaceAll(",", "\\,");
    query = query.or(
      `producer.ilike.%${escaped}%,name.ilike.%${escaped}%,region.ilike.%${escaped}%,country.ilike.%${escaped}%`
    );
  }

  if (sort === "purchase_desc") {
    query = query
      .order("last_purchased_at", { ascending: false, nullsFirst: false })
      .order("id", { ascending: false });
  } else if (sort === "purchase_asc") {
    query = query
      .order("last_purchased_at", { ascending: true, nullsFirst: false })
      .order("id", { ascending: false });
  } else if (sort === "price_desc") {
    query = query
      .order("avg_purchase_price", { ascending: false })
      .order("id", { ascending: false });
  } else if (sort === "price_asc") {
    query = query
      .order("avg_purchase_price", { ascending: true })
      .order("id", { ascending: true });
  } else if (sort === "rating_desc") {
    query = query
      .order("rating", { ascending: false, nullsFirst: false })
      .order("id", { ascending: false });
  } else if (sort === "vintage_asc") {
    query = query
      .order("vintage", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true });
  } else if (sort === "vintage_desc") {
    query = query
      .order("vintage", { ascending: false, nullsFirst: false })
      .order("id", { ascending: false });
  } else {
    query = query
      .order("stock_qty", { ascending: false })
      .order("id", { ascending: false });
  }

  const rangeEnd = offset + limit; // fetch limit+1
  const result = await query.range(offset, rangeEnd);
  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  const rows = result.data ?? [];
  const pageRows = rows.slice(0, limit);
  const hasMore = rows.length > limit;
  const nextCursor = hasMore ? encodeCursor(offset + limit) : null;

  const signedThumbs = await resolveWineImageUrls(
    supabase,
    pageRows.map((w) => w.label_photo_urls?.[0] ?? null)
  );

  const wines = pageRows.map((w, idx) => ({
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

  const stats = includeStats
    ? await (supabase as any).rpc("rpc_cellar_stats", {
        p_house_id: houseId,
        // 대시보드 통계는 "하우스 전체 요약" (필터 무관)
        p_q: null,
        p_stock: "all",
        p_consumed_only: false,
        p_type: null,
        p_country: null,
        p_price_min: null,
        p_price_max: null,
      })
    : null;

  return NextResponse.json({
    wines,
    nextCursor,
    hasMore,
    stats: includeStats ? stats?.data ?? null : null,
  });
}
