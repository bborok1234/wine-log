import Image from "next/image";

import { Layout } from "@/components/layout";
import { Button, Card, Input, TextArea, WineTypeBadge } from "@/components/ui";
import { getFlash } from "@/lib/flash";
import { createClient } from "@/lib/supabase/server";
import { requireAuthedUser, requireHouseAccess } from "@/lib/house";

import { AiSommelier } from "./ai-sommelier";
import { openBottleFromDetail, updateNotes } from "./actions";

export default async function WineDetailPage({
  params,
}: {
  params: Promise<{ houseId: string; wineId: string }>;
}) {
  const { houseId, wineId } = await params;
  const flash = await getFlash();

  const supabase = await createClient();
  await requireAuthedUser(supabase);
  await requireHouseAccess(supabase, houseId);

  const wine = await supabase
    .from("wines")
    .select(
      "id,producer,name,vintage,country,region,type,stock_qty,avg_purchase_price,rating,comment,tasting_review,label_photo_urls"
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
    .select("id,purchased_at,store,unit_price,quantity,receipt_photo_url,created_at")
    .eq("house_id", houseId)
    .eq("wine_id", wineId)
    .order("purchased_at", { ascending: false })
    .limit(50);

  const w = wine.data;
  const isOutOfStock = w.stock_qty === 0;
  const hero = w.label_photo_urls?.[0] ?? null;

  return (
    <Layout
      backHref={`/h/${houseId}/cellar`}
      transparentHeader={!!hero}
      title={
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 font-extrabold mb-0.5">
            Wine
          </span>
          <span className="text-xl font-serif text-stone-800 truncate">
            {w.producer}
          </span>
        </div>
      }
      actions={
        <a
          href={`/h/${houseId}/purchase/new?wineId=${w.id}`}
          className="p-2.5 rounded-full hover:bg-stone-100 transition-colors text-wine-700"
          title="구매 추가"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      }
    >
      {hero ? (
        <div className="relative w-full h-80 bg-stone-200">
          <Image
            src={hero}
            alt={w.name ?? w.producer}
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F9F9F8] via-transparent to-black/10" />
        </div>
      ) : null}

      <div className={["px-5 space-y-4 pb-24", hero ? "-mt-14 relative z-10" : "pt-6"].join(" ")}>
        {flash?.kind === "error" ? (
          <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {flash.message}
          </div>
        ) : null}

        <Card className="animate-fade-in-up">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3">
              <WineTypeBadge type={w.type} />
            </div>
            <div className="text-3xl font-bold text-stone-900 leading-tight tracking-tight font-serif">
              {w.producer}
            </div>
            {w.name ? (
              <div className="text-lg text-stone-600 font-medium mt-1">
                {w.name}{" "}
                <span className="text-stone-400 font-normal">{w.vintage}</span>
              </div>
            ) : null}
            <div className="flex items-center gap-2 mt-3 text-stone-500 text-sm font-medium tracking-wide">
              {w.vintage ? (
                <span className="bg-stone-100 px-2 py-0.5 rounded-md text-stone-600">
                  {w.vintage}
                </span>
              ) : null}
              {w.region ? <span>{w.region}</span> : null}
              {w.country ? <span className="text-stone-400">| {w.country}</span> : null}
            </div>

            <div className="mt-8 mb-6 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-wine-100/50 to-pink-100/50 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div
                className={[
                  "w-32 h-32 relative rounded-full flex flex-col items-center justify-center shadow-2xl",
                  w.stock_qty > 0
                    ? "bg-white/80 backdrop-blur-md border border-white"
                    : "bg-stone-50 border border-stone-100",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-6xl font-bold",
                    w.stock_qty > 0 ? "text-stone-800" : "text-stone-300",
                  ].join(" ")}
                >
                  {w.stock_qty}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-2">
                  Bottles Left
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[24px] bg-white p-5 border border-stone-100 shadow-sm text-center">
              <div className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest mb-1">
                Avg Price
              </div>
              <div className="text-xl font-bold text-stone-800">
                {w.avg_purchase_price > 0
                  ? Math.round(w.avg_purchase_price).toLocaleString()
                  : "-"}
                <span className="text-stone-400 text-sm ml-1">원</span>
              </div>
            </div>
            <div className="rounded-[24px] bg-white p-5 border border-stone-100 shadow-sm text-center">
              <div className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest mb-1">
                Total Bought
              </div>
              <div className="text-xl font-bold text-stone-800">
                {purchases.data?.reduce((acc, p) => acc + p.quantity, 0) ?? 0}
                <span className="text-stone-400 text-sm ml-1">병</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <a className="flex-1" href={`/h/${houseId}/purchase/new?wineId=${w.id}`}>
              <Button variant="secondary" fullWidth className="!py-3">
                구매 추가
              </Button>
            </a>
            <form className="flex-1">
              <input type="hidden" name="houseId" value={houseId} />
              <input type="hidden" name="wineId" value={w.id} />
              <Button
                fullWidth
                className="!py-3"
                variant={isOutOfStock ? "secondary" : "primary"}
                disabled={isOutOfStock}
                formAction={openBottleFromDetail}
              >
                {isOutOfStock ? "재고 없음" : "한 병 마시기 🥂"}
              </Button>
            </form>
          </div>

          <div className="mt-4">
            <AiSommelier houseId={houseId} wineId={w.id} />
          </div>
        </Card>

        <Card className="animate-fade-in-up">
          <div className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest mb-4">
            Notes
          </div>

          <form>
            <input type="hidden" name="houseId" value={houseId} />
            <input type="hidden" name="wineId" value={w.id} />

            <Input
              label="평점(1~5)"
              name="rating"
              inputMode="numeric"
              defaultValue={w.rating ?? ""}
              placeholder="예: 4"
            />
            <Input
              label="한줄 평"
              name="comment"
              defaultValue={w.comment ?? ""}
              placeholder="짧게 기록해요"
            />
            <TextArea
              label="테이스팅 리뷰"
              name="tasting_review"
              defaultValue={w.tasting_review ?? ""}
              placeholder="향/맛/바디/피니시..."
            />

            <Button fullWidth variant="secondary" formAction={updateNotes}>
              노트 저장
            </Button>
          </form>
        </Card>

        <Card className="animate-fade-in-up">
          <div className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest mb-4">
            Purchases
          </div>

          {purchases.error ? (
            <div className="text-sm text-red-600">{purchases.error.message}</div>
          ) : purchases.data?.length ? (
            <div className="space-y-3">
              {purchases.data.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl bg-white border border-stone-100 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-bold text-stone-800">
                      {new Date(p.purchased_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      + {p.quantity}병
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="text-sm text-stone-500 font-medium truncate">
                      {p.store}
                    </div>
                    <div className="text-sm font-bold text-stone-700">
                      {Math.round(p.unit_price).toLocaleString()}원
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-stone-500 font-medium">
              구매 기록이 없어요.
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}


