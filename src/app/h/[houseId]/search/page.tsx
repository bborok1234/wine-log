import { Layout } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import { requireAuthedUser, requireHouseAccess } from "@/lib/house";
import { createClient } from "@/lib/supabase/server";

import { SearchBox } from "./search-box";

function toIlikeQuery(q: string) {
  const trimmed = q.trim();
  return trimmed ? `%${trimmed}%` : "";
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ houseId: string }>;
  searchParams?: Promise<{ q?: string }>;
}) {
  const { houseId } = await params;
  const sp = (await searchParams) ?? {};
  const q = sp.q ?? "";

  const supabase = await createClient();
  await requireAuthedUser(supabase);
  await requireHouseAccess(supabase, houseId);

  const ilike = toIlikeQuery(q);
  const results =
    ilike.length > 0
      ? await supabase
          .from("wines")
          .select(
            "id,producer,name,vintage,region,country,type,stock_qty,avg_purchase_price"
          )
          .eq("house_id", houseId)
          .or(
            [
              `producer.ilike.${ilike}`,
              `name.ilike.${ilike}`,
              `region.ilike.${ilike}`,
              `country.ilike.${ilike}`,
            ].join(",")
          )
          .order("stock_qty", { ascending: false })
          .limit(50)
      : { data: [], error: null };

  return (
    <Layout
      backHref={`/h/${houseId}/cellar`}
      title={
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 font-extrabold mb-0.5">
            Search
          </span>
          <span className="text-xl font-serif text-stone-800">검색</span>
        </div>
      }
      actions={
        <a
          href={`/h/${houseId}/purchase/new?q=${encodeURIComponent(q)}`}
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
      <div className="px-5 pt-6 space-y-4 pb-24">
        <Card className="animate-fade-in-up">
          <SearchBox />
        </Card>

        {results.error ? (
          <Card className="animate-fade-in-up">
            <div className="text-sm text-red-600">{results.error.message}</div>
          </Card>
        ) : null}

        {q.trim().length === 0 ? (
          <Card className="animate-fade-in-up">
            <div className="text-sm text-stone-500 font-medium">
              검색어를 입력하면 즉시 결과가 보여요.
            </div>
          </Card>
        ) : results.data?.length ? (
          results.data.map((wine, index) => (
            <div
              key={wine.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 25}ms` }}
            >
              <a href={`/h/${houseId}/wine/${wine.id}`}>
                <Card className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-bold text-stone-900 truncate">
                      {wine.producer}
                    </div>
                    <div className="text-stone-600 font-medium truncate mt-1">
                      {wine.name}{" "}
                      <span className="text-stone-400 font-normal">
                        {wine.vintage ?? "NV"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                      {wine.region ? (
                        <span className="bg-stone-100 text-stone-500 px-2 py-1 rounded-full">
                          {wine.region}
                        </span>
                      ) : null}
                      <span className="bg-wine-50 text-wine-700 border border-wine-100 px-2 py-1 rounded-full">
                        재고 {wine.stock_qty}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-stone-400 uppercase tracking-widest">
                      Avg
                    </div>
                    <div className="font-bold text-stone-800">
                      {wine.avg_purchase_price > 0
                        ? Math.round(wine.avg_purchase_price).toLocaleString()
                        : "-"}
                      <span className="text-stone-400 text-sm ml-1">원</span>
                    </div>
                  </div>
                </Card>
              </a>
            </div>
          ))
        ) : (
          <Card className="animate-fade-in-up">
            <div className="text-sm text-stone-600 font-medium">
              결과가 없어요. 새 와인으로 바로 추가할까요?
            </div>
            <div className="mt-4">
              <a href={`/h/${houseId}/purchase/new?q=${encodeURIComponent(q)}`}>
                <Button fullWidth>새 와인 + 구매 추가</Button>
              </a>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
