import { Layout } from "@/components/layout";
import { Card } from "@/components/ui";
import { getFlash } from "@/lib/flash";
import { requireAuthedUser, requireHouseAccess } from "@/lib/house";
import { parseSommelierAdvice } from "@/lib/sommelier-advice";
import { resolveWineImageUrl } from "@/lib/storage-image";
import { createClient } from "@/lib/supabase/server";

import {
  deletePurchase,
  deleteWine,
  openBottleFromDetail,
  updateNotes,
  updatePurchase,
  updateWineInfo,
} from "./actions";
import { WineDetailShell } from "./wine-detail-shell";

export default async function WineDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ houseId: string; wineId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { houseId, wineId } = await params;
  const sp = (await (searchParams ?? Promise.resolve({}))) as Record<
    string,
    string | string[] | undefined
  >;
  const flash = await getFlash();

  const supabase = await createClient();
  await requireAuthedUser(supabase);
  await requireHouseAccess(supabase, houseId);

  const wine = await supabase
    .from("wines")
    .select(
      "id,producer,name,vintage,country,region,type,stock_qty,avg_purchase_price,rating,comment,tasting_review,label_photo_urls,sommelier_advice"
    )
    .eq("id", wineId)
    .eq("house_id", houseId)
    .maybeSingle();

  if (wine.error)
    return (
      <Layout backHref={`/h/${houseId}/cellar`} title="와인 상세">
        <div className="px-5 pt-6">
          <Card className="animate-fade-in-up">
            <div className="text-sm text-red-600">{wine.error.message}</div>
          </Card>
        </div>
      </Layout>
    );

  if (!wine.data)
    return (
      <Layout backHref={`/h/${houseId}/cellar`} title="와인 상세">
        <div className="px-5 pt-6">
          <Card className="animate-fade-in-up">
            <div className="text-sm text-stone-600">와인을 찾을 수 없어요.</div>
          </Card>
        </div>
      </Layout>
    );

  const purchases = await supabase
    .from("purchases")
    .select(
      "id,purchased_at,store,unit_price,quantity,receipt_photo_url,created_at"
    )
    .eq("house_id", houseId)
    .eq("wine_id", wineId)
    .order("purchased_at", { ascending: false })
    .limit(50);

  const w = wine.data;
  const hero = await resolveWineImageUrl(
    supabase,
    w.label_photo_urls?.[0] ?? null
  );

  if (purchases.error)
    return (
      <Layout backHref={`/h/${houseId}/cellar`} title="와인 상세">
        <div className="px-5 pt-6">
          <Card className="animate-fade-in-up">
            <div className="text-sm text-red-600">
              {purchases.error.message}
            </div>
          </Card>
        </div>
      </Layout>
    );

  const backParams = new URLSearchParams();
  const safeString = (value: unknown) =>
    typeof value === "string" ? value : undefined;
  const q = safeString(sp.q);
  const stock = safeString(sp.stock);
  const type = safeString(sp.type);
  const country = safeString(sp.country);
  const sort = safeString(sp.sort);
  const priceMin = safeString(sp.priceMin);
  const priceMax = safeString(sp.priceMax);

  if (q) backParams.set("q", q);
  if (stock) backParams.set("stock", stock);
  if (type) backParams.set("type", type);
  if (country) backParams.set("country", country);
  if (sort) backParams.set("sort", sort);
  if (priceMin) backParams.set("priceMin", priceMin);
  if (priceMax) backParams.set("priceMax", priceMax);

  const backHref = backParams.toString()
    ? `/h/${houseId}/cellar?${backParams.toString()}`
    : `/h/${houseId}/cellar`;

  return (
    <WineDetailShell
      houseId={houseId}
      heroUrl={hero}
      backHref={backHref}
      flashError={flash?.kind === "error" ? flash.message : null}
      wine={{
        id: w.id,
        producer: w.producer,
        name: w.name,
        vintage: w.vintage,
        country: w.country,
        region: w.region,
        type: w.type,
        stockQty: w.stock_qty,
        avgPurchasePrice: w.avg_purchase_price,
        rating: w.rating,
        comment: w.comment,
        tastingReview: w.tasting_review,
        sommelierAdvice: parseSommelierAdvice(w.sommelier_advice),
      }}
      purchases={
        purchases.data?.map((p) => {
          const dateRaw = p.purchased_at ?? p.created_at;
          const dateLabel = dateRaw
            ? new Intl.DateTimeFormat("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                timeZone: "UTC",
              }).format(new Date(dateRaw))
            : "-";
          return {
            id: p.id,
            purchasedAt: p.purchased_at,
            createdAt: p.created_at,
            store: p.store,
            unitPrice: p.unit_price,
            quantity: p.quantity,
            dateLabel,
          };
        }) ?? []
      }
      openBottleAction={openBottleFromDetail}
      updateNotesAction={updateNotes}
      updateWineInfoAction={updateWineInfo}
      updatePurchaseAction={updatePurchase}
      deleteWineAction={deleteWine}
      deletePurchaseAction={deletePurchase}
    />
  );
}
