import { ActionButton } from "@/components/action-button";
import { Layout } from "@/components/layout";
import { Card, Input, WineTypeBadge } from "@/components/ui";
import { SelectField } from "@/components/ui/select-field";
import { getFlash } from "@/lib/flash";
import { requireAuthedUser, requireHouseAccess } from "@/lib/house";
import { resolveWineImageUrls } from "@/lib/storage-image";
import { createClient } from "@/lib/supabase/server";

import { SearchBox } from "@/app/h/[houseId]/search/search-box";

import { savePurchase } from "./actions";
import { AiWineAutofill } from "./ai-wine-autofill";
import { AutocompleteInput } from "./autocomplete-input";

function toSortedUniqueByCount(values: Array<string | null | undefined>) {
  const counts = new Map<string, number>();
  for (const raw of values) {
    const v = raw?.trim();
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"))
    .map(([v]) => v);
}

export default async function AddPurchasePage({
  params,
  searchParams,
}: {
  params: { houseId: string } | Promise<{ houseId: string }>;
  searchParams?:
    | { wineId?: string; q?: string; step?: "select" | "create" | "form" }
    | Promise<{
        wineId?: string;
        q?: string;
        step?: "select" | "create" | "form";
      }>;
}) {
  const { houseId } = await Promise.resolve(params);
  const sp = await Promise.resolve(searchParams ?? {});
  const wineId = sp.wineId ?? "";
  const q = sp.q ?? "";
  const step: "select" | "create" | "form" =
    sp.step ?? (wineId ? "form" : "select");
  const flash = await getFlash();

  const supabase = await createClient();
  await requireAuthedUser(supabase);
  await requireHouseAccess(supabase, houseId);

  if (step === "select") {
    const escaped = q.replaceAll(",", "\\,");
    const result = q
      ? await supabase
          .from("wines")
          .select("id,producer,name,vintage,type,region,label_photo_urls")
          .eq("house_id", houseId)
          .or(`producer.ilike.%${escaped}%,name.ilike.%${escaped}%`)
          .limit(20)
      : { data: [], error: null as null | { message: string } };
    const signedThumbs = await resolveWineImageUrls(
      supabase,
      (result.data ?? []).map((w) => w.label_photo_urls?.[0] ?? null)
    );

    return (
      <Layout backHref={`/h/${houseId}/cellar`} title="와인 선택">
        <div className="p-4">
          <SearchBox
            placeholder="우리집 와인 검색..."
            inputClassName="!bg-white !border !border-wine-100 !shadow-none !rounded-[28px] !py-4"
          />

          <div className="mb-6 mt-5">
            <a
              href={`/h/${houseId}/purchase/new?step=create&q=${encodeURIComponent(
                q
              )}`}
              className="w-full py-4 border-2 border-dashed border-stone-300 rounded-2xl text-stone-500 font-bold hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center gap-2 group"
            >
              <span className="w-8 h-8 rounded-full bg-stone-100 text-stone-400 group-hover:bg-rose-100 group-hover:text-rose-500 flex items-center justify-center transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </span>
              새 와인 등록하기(사진/직접)
            </a>
          </div>

          {flash?.kind === "error" ? (
            <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 mb-4">
              {flash.message}
            </div>
          ) : null}

          <div className="space-y-3">
            {result.error ? (
              <Card className="animate-fade-in-up">
                <div className="text-sm text-red-600">
                  {result.error.message}
                </div>
              </Card>
            ) : result.data?.length ? (
              <>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider px-2">
                  검색 결과
                </p>
                {result.data.map((wine, idx) => {
                  const thumbnail = signedThumbs[idx] ?? null;
                  return (
                    <a
                      key={wine.id}
                      href={`/h/${houseId}/purchase/new?step=form&wineId=${
                        wine.id
                      }&q=${encodeURIComponent(q)}`}
                    >
                      <Card>
                        <div className="flex gap-3">
                          {thumbnail ? (
                            <div
                              className="w-12 h-16 rounded-lg bg-stone-200 bg-cover bg-center flex-shrink-0"
                              style={{ backgroundImage: `url(${thumbnail})` }}
                            />
                          ) : (
                            <div className="w-12 h-16 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0 text-xl">
                              🍷
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-stone-800 text-lg truncate">
                              {wine.producer}
                            </div>
                            <div className="text-stone-500 font-medium truncate">
                              {wine.name}{" "}
                              <span className="text-stone-400">
                                {wine.vintage ?? "NV"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </a>
                  );
                })}
              </>
            ) : q ? (
              <div className="p-4 text-center text-stone-400 italic">
                보유 중인 와인이 없어요.
              </div>
            ) : null}
          </div>
        </div>
      </Layout>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const existingWine =
    step === "form" && wineId
      ? await supabase
          .from("wines")
          .select(
            "id,producer,name,vintage,country,region,type,label_photo_urls"
          )
          .eq("id", wineId)
          .eq("house_id", houseId)
          .maybeSingle()
      : { data: null, error: null };

  const fieldSuggestions =
    step === "create"
      ? await supabase
          .from("wines")
          .select("producer,country,region")
          .eq("house_id", houseId)
          .limit(2000)
      : { data: null, error: null as null | { message: string } };

  const producerSuggestions = toSortedUniqueByCount(
    (fieldSuggestions.data ?? []).map((w) => w.producer)
  );
  const countrySuggestions = toSortedUniqueByCount(
    (fieldSuggestions.data ?? []).map((w) => w.country)
  );
  const regionSuggestions = toSortedUniqueByCount(
    (fieldSuggestions.data ?? []).map((w) => w.region)
  );

  const storeSuggestionsQuery = await supabase
    .from("purchases")
    .select("store,created_at")
    .eq("house_id", houseId)
    .order("created_at", { ascending: false })
    .limit(2000);

  const storeSuggestions = toSortedUniqueByCount(
    (storeSuggestionsQuery.data ?? []).map((p) => p.store)
  );

  return (
    <Layout
      backHref={
        step === "create"
          ? `/h/${houseId}/purchase/new?step=select&q=${encodeURIComponent(q)}`
          : `/h/${houseId}/purchase/new?step=select&q=${encodeURIComponent(q)}`
      }
      title={step === "create" ? "새 와인 등록" : "구매 기록 추가"}
    >
      <div className="px-5 pt-6 space-y-4 pb-24">
        {flash?.kind === "error" ? (
          <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {flash.message}
          </div>
        ) : null}

        <Card className="animate-fade-in-up">
          <form>
            <input type="hidden" name="houseId" value={houseId} />
            <input
              type="hidden"
              name="wineId"
              value={existingWine.data?.id ?? ""}
            />

            {existingWine.error ? (
              <div className="text-sm text-red-600 mb-4">
                {existingWine.error.message}
              </div>
            ) : step === "form" && existingWine.data ? (
              <div className="mb-4 rounded-2xl bg-stone-50 border border-stone-100 p-4">
                <div className="text-xs font-extrabold text-stone-400 uppercase tracking-widest">
                  선택된 와인
                </div>
                <div className="mt-2 font-bold text-stone-900">
                  {existingWine.data.producer}
                </div>
                <div className="text-stone-600 font-medium">
                  {existingWine.data.name}{" "}
                  <span className="text-stone-400 font-normal">
                    {existingWine.data.vintage ?? "NV"}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <WineTypeBadge type={existingWine.data.type} />
                  {existingWine.data.region ? (
                    <span className="truncate max-w-[140px] text-[10px] bg-white text-stone-500 px-2 py-0.5 rounded-full font-bold border border-stone-100">
                      {existingWine.data.region}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3">
                  <a
                    className="text-sm font-bold text-wine-700 hover:underline"
                    href={`/h/${houseId}/purchase/new?step=select&q=${encodeURIComponent(
                      q || existingWine.data.name
                    )}`}
                  >
                    다른 와인 선택하기 →
                  </a>
                </div>
              </div>
            ) : step === "create" ? (
              <>
                <div className="mb-5 space-y-3">
                  <div className="block text-xl font-bold text-stone-800">
                    어떤 와인인가요?
                  </div>
                  <AiWineAutofill initialText={q} houseId={houseId} />
                </div>

                <div className="border-t border-stone-200/50 pt-5 mt-5">
                  <div className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest mb-4">
                    상세 정보 확인
                  </div>
                  <AutocompleteInput
                    label="생산자"
                    id="ai-producer"
                    name="producer"
                    defaultValue={q}
                    suggestions={producerSuggestions}
                    required
                  />
                  <Input label="이름" id="ai-name" name="name" required />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="빈티지(선택)"
                      id="ai-vintage"
                      name="vintage"
                      inputMode="numeric"
                      placeholder="NV"
                    />
                    <SelectField
                      label="종류(선택)"
                      name="type"
                      defaultValue="red"
                      options={[
                        { label: "레드", value: "red" },
                        { label: "화이트", value: "white" },
                        { label: "스파클링", value: "sparkling" },
                        { label: "로제", value: "rose" },
                        { label: "디저트", value: "dessert" },
                        { label: "주정강화", value: "fortified" },
                        { label: "기타", value: "other" },
                      ]}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <AutocompleteInput
                      label="국가(선택)"
                      id="ai-country"
                      name="country"
                      suggestions={countrySuggestions}
                    />
                    <AutocompleteInput
                      label="지역(선택)"
                      id="ai-region"
                      name="region"
                      suggestions={regionSuggestions}
                    />
                  </div>
                </div>
              </>
            ) : null}

            {step !== "form" || existingWine.data ? (
              <div className="border-t border-stone-200/50 pt-5 mt-5">
                <div className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest mb-4">
                  구매 정보
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="가격(병당)"
                    name="unit_price"
                    inputMode="numeric"
                    required
                  />
                  <Input
                    label="수량"
                    name="quantity"
                    inputMode="numeric"
                    defaultValue="1"
                    required
                  />
                </div>
                <AutocompleteInput
                  label="구매처"
                  id="store"
                  name="store"
                  suggestions={storeSuggestions}
                  required
                />
                <Input
                  label="구매일"
                  name="purchased_at"
                  type="date"
                  defaultValue={today}
                />
              </div>
            ) : null}

            <div className="pt-4">
              <ActionButton
                fullWidth
                formAction={savePurchase}
                pendingText="저장 중..."
              >
                저장
              </ActionButton>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
