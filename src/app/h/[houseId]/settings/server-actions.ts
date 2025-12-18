"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";

import { setFlash } from "@/lib/flash";
import { requireAuthedUser, requireHouseAccess } from "@/lib/house";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function chunkArray<T>(items: T[], size: number) {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    chunks.push(items.slice(i, i + size));
  return chunks;
}

function toWineKey(producer: string, name: string, vintage: number | null) {
  const v = vintage === null ? "NV" : String(vintage);
  return `${producer}||${name}||${v}`;
}

function toIsoDateOrUndefined(value: unknown) {
  if (value === null || value === undefined) return undefined;

  if (typeof value === "number" && Number.isFinite(value)) {
    // Excel serial date (e.g. 45795). Convert to YYYY-MM-DD.
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return undefined;
    const date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return undefined;

    // Prefer already-ISO-like date strings.
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    const date = new Date(s);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString().slice(0, 10);
  }

  return undefined;
}

export async function createInvite(formData: FormData) {
  const houseId = getString(formData, "houseId");
  const role = getString(formData, "role") || "editor";
  if (!houseId) redirect("/app?error=bad-request");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase.rpc("rpc_create_invite", {
    p_house_id: houseId,
    p_role: role,
  });

  if (error) {
    redirect(
      `/h/${houseId}/settings?error=${encodeURIComponent(error.message)}`
    );
  }

  redirect(
    `/h/${houseId}/settings?invitePath=${encodeURIComponent(`/invite/${data}`)}`
  );
}

export async function removeMember(formData: FormData) {
  const houseId = getString(formData, "houseId");
  const userId = getString(formData, "userId");
  if (!houseId || !userId) redirect("/app?error=bad-request");

  const supabase = await createClient();
  await requireAuthedUser(supabase);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (user.id === userId) {
    redirect(
      `/h/${houseId}/settings?error=${encodeURIComponent(
        "본인은 삭제할 수 없어요."
      )}`
    );
  }

  const owners = await supabase
    .from("house_members")
    .select("user_id")
    .eq("house_id", houseId)
    .eq("role", "owner");
  const target = await supabase
    .from("house_members")
    .select("role")
    .eq("house_id", houseId)
    .eq("user_id", userId)
    .maybeSingle();

  if (target.data?.role === "owner" && (owners.data?.length ?? 0) <= 1) {
    redirect(
      `/h/${houseId}/settings?error=${encodeURIComponent(
        "마지막 소유자는 삭제할 수 없어요."
      )}`
    );
  }

  const { error } = await supabase
    .from("house_members")
    .delete()
    .eq("house_id", houseId)
    .eq("user_id", userId);

  if (error) {
    redirect(
      `/h/${houseId}/settings?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/h/${houseId}/settings`);
  redirect(`/h/${houseId}/settings`);
}

export async function updateProfile(formData: FormData) {
  const houseId = getString(formData, "houseId");
  if (!houseId) redirect("/app?error=bad-request");

  const nickname = getString(formData, "nickname") || null;

  const supabase = await createClient();
  await requireAuthedUser(supabase);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const updated = await supabase
    .from("profiles")
    .update({ nickname })
    .eq("id", user.id)
    .select("id");

  if (updated.error) {
    redirect(
      `/h/${houseId}/settings?error=${encodeURIComponent(
        updated.error.message
      )}`
    );
  }

  // 마이그레이션 이전 가입자: profiles row 자체가 없으면 update가 0 rows가 될 수 있음.
  // insert policy가 있는 경우, 여기서 안전하게 생성한다.
  if ((updated.data?.length ?? 0) === 0) {
    const inserted = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? null,
      nickname,
      joined_at: user.created_at ?? new Date().toISOString(),
    });
    if (inserted.error) {
      redirect(
        `/h/${houseId}/settings?error=${encodeURIComponent(
          inserted.error.message
        )}`
      );
    }
  }

  revalidatePath(`/h/${houseId}/settings`);
  redirect(`/h/${houseId}/settings`);
}

interface ImportRow {
  producer?: string;
  name?: string;
  vintage?: number;
  country?: string;
  region?: string;
  type?: string;
  stock_qty?: number;
  purchase_qty_total?: number;
  purchase_value_total?: number;
  purchased_at?: string;
  store?: string;
}

export async function importWines(formData: FormData) {
  const houseId = getString(formData, "houseId");
  if (!houseId) {
    await setFlash({ kind: "error", message: "houseId가 필요합니다." });
    redirect("/app");
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    await setFlash({ kind: "error", message: "파일을 선택해주세요." });
    redirect(`/h/${houseId}/settings`);
  }

  const supabase = await createClient();
  await requireAuthedUser(supabase);
  await requireHouseAccess(supabase, houseId);

  try {
    // 파일을 버퍼로 읽기
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<ImportRow>(worksheet);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    const normalized = rows
      .map((row) => {
        const producer = row.producer ? String(row.producer).trim() : "";
        const name = row.name ? String(row.name).trim() : "";
        const stockQty = Number.isFinite(row.stock_qty)
          ? Math.trunc(Number(row.stock_qty))
          : NaN;

        if (!producer || !name || !Number.isFinite(stockQty)) return null;
        if (stockQty === 0) return null;

        const vintage = Number.isFinite(row.vintage)
          ? Math.trunc(Number(row.vintage))
          : null;
        const country = row.country ? String(row.country).trim() || null : null;
        const region = row.region ? String(row.region).trim() || null : null;
        const type = row.type ? String(row.type).trim() || null : null;
        const purchaseQtyTotal = Math.trunc(
          Number(row.purchase_qty_total ?? stockQty)
        );
        const purchaseValueTotal = Number(row.purchase_value_total ?? 0);
        const unitPrice =
          purchaseQtyTotal > 0 ? purchaseValueTotal / purchaseQtyTotal : 0;
        const purchasedAt = toIsoDateOrUndefined(row.purchased_at);
        const store = row.store
          ? String(row.store).trim() || "Import"
          : "Import";

        return {
          row,
          producer,
          name,
          vintage,
          country,
          region,
          type,
          purchaseQtyTotal,
          unitPrice,
          purchasedAt,
          store,
        };
      })
      .filter((v): v is NonNullable<typeof v> => Boolean(v));

    skipCount = rows.length - normalized.length;

    // 기존 와인 목록을 한 번에 가져와서 row-by-row 조회를 제거한다.
    const wineRows: Array<{
      id: string;
      producer: string;
      name: string | null;
      vintage: number | null;
    }> = [];
    const pageSize = 2000;
    for (let from = 0; ; from += pageSize) {
      const page = await supabase
        .from("wines")
        .select("id,producer,name,vintage")
        .eq("house_id", houseId)
        .range(from, from + pageSize - 1);
      if (page.error) throw new Error(page.error.message);
      wineRows.push(...(page.data ?? []));
      if ((page.data ?? []).length < pageSize) break;
    }

    const wineIdByKey = new Map<string, string>();
    for (const w of wineRows) {
      const key = toWineKey(
        String(w.producer ?? "").trim(),
        String(w.name ?? "").trim(),
        w.vintage ?? null
      );
      if (key === "||NV") continue;
      wineIdByKey.set(key, w.id);
    }

    // 필요한 신규 와인만 unique하게 모아서 bulk insert
    const newWinePayloads: Array<{
      house_id: string;
      producer: string;
      name: string;
      vintage: number | null;
      country: string | null;
      region: string | null;
      type: string | null;
      stock_qty: number;
      purchase_qty_total: number;
      purchase_value_total: number;
      avg_purchase_price: number;
    }> = [];
    const seenNewKeys = new Set<string>();
    for (const n of normalized) {
      const key = toWineKey(n.producer, n.name, n.vintage);
      if (wineIdByKey.has(key)) continue;
      if (seenNewKeys.has(key)) continue;
      seenNewKeys.add(key);
      newWinePayloads.push({
        house_id: houseId,
        producer: n.producer,
        name: n.name,
        vintage: n.vintage,
        country: n.country,
        region: n.region,
        type: n.type,
        stock_qty: 0,
        purchase_qty_total: 0,
        purchase_value_total: 0,
        avg_purchase_price: 0,
      });
    }

    for (const chunk of chunkArray(newWinePayloads, 500)) {
      if (chunk.length === 0) continue;
      const inserted = await supabase
        .from("wines")
        .insert(chunk)
        .select("id,producer,name,vintage");
      if (inserted.error) {
        logger.error("[importWines] Bulk wine insert failed", {
          error: inserted.error,
          count: chunk.length,
        });
        throw new Error(inserted.error.message);
      }

      for (const w of inserted.data ?? []) {
        const key = toWineKey(
          String(w.producer ?? "").trim(),
          String(w.name ?? "").trim(),
          w.vintage ?? null
        );
        wineIdByKey.set(key, w.id);
      }
    }

    const purchasesPayloads: Array<{
      house_id: string;
      wine_id: string;
      unit_price: number;
      quantity: number;
      purchased_at?: string;
      store: string;
    }> = [];

    for (const n of normalized) {
      const key = toWineKey(n.producer, n.name, n.vintage);
      const wineId = wineIdByKey.get(key);
      if (!wineId) {
        logger.error("[importWines] Missing wineId after insert", {
          key,
          row: n.row,
        });
        errorCount++;
        continue;
      }

      purchasesPayloads.push({
        house_id: houseId,
        wine_id: wineId,
        unit_price: n.unitPrice,
        quantity: n.purchaseQtyTotal,
        purchased_at: n.purchasedAt,
        store: n.store,
      });
    }

    for (const chunk of chunkArray(purchasesPayloads, 500)) {
      if (chunk.length === 0) continue;
      const inserted = await supabase.from("purchases").insert(chunk);
      if (inserted.error) {
        logger.error("[importWines] Bulk purchase insert failed", {
          error: inserted.error,
          count: chunk.length,
        });
        errorCount += chunk.length;
        continue;
      }
      successCount += chunk.length;
    }

    await setFlash({
      kind: "success",
      message: `가져오기 완료: 성공 ${successCount}개, 건너뜀 ${skipCount}개, 실패 ${errorCount}개`,
    });
  } catch (e) {
    logger.error("[importWines] Import failed", { error: e });
    await setFlash({
      kind: "error",
      message: `가져오기 실패: ${
        e instanceof Error ? e.message : "알 수 없는 오류"
      }`,
    });
  }

  revalidatePath(`/h/${houseId}/cellar`);
  redirect(`/h/${houseId}/settings`);
}
