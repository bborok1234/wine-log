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
    await setFlash({ kind: "error", message: error.message });
    redirect(`/h/${houseId}/settings`);
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
    await setFlash({ kind: "error", message: "본인은 삭제할 수 없어요." });
    redirect(`/h/${houseId}/settings`);
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
    await setFlash({
      kind: "error",
      message: "마지막 소유자는 삭제할 수 없어요.",
    });
    redirect(`/h/${houseId}/settings`);
  }

  const { error } = await supabase
    .from("house_members")
    .delete()
    .eq("house_id", houseId)
    .eq("user_id", userId);

  if (error) {
    await setFlash({ kind: "error", message: error.message });
    redirect(`/h/${houseId}/settings`);
  }

  revalidatePath(`/h/${houseId}/settings`);
  redirect(`/h/${houseId}/settings?memberRemoved=1`);
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
    await setFlash({ kind: "error", message: updated.error.message });
    redirect(`/h/${houseId}/settings`);
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
      await setFlash({ kind: "error", message: inserted.error.message });
      redirect(`/h/${houseId}/settings`);
    }
  }

  revalidatePath(`/h/${houseId}/settings`);
  redirect(`/h/${houseId}/settings?profileSaved=1`);
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

    for (const row of rows) {
      try {
        // 필수 필드 검증 (빈티지는 NV 지원으로 optional)
        if (!row.producer || !row.name || !Number.isFinite(row.stock_qty)) {
          logger.warn(
            "[importWines] Skipping row with missing required fields",
            {
              row,
            }
          );
          skipCount++;
          continue;
        }

        // 재고가 0이면 skip
        if (row.stock_qty === 0) {
          skipCount++;
          continue;
        }

        const producer = String(row.producer).trim();
        const name = String(row.name).trim();
        const vintage = Number.isFinite(row.vintage)
          ? Math.trunc(Number(row.vintage))
          : null;
        const country = row.country ? String(row.country).trim() || null : null;
        const region = row.region ? String(row.region).trim() || null : null;
        const type = row.type ? String(row.type).trim() || null : null;
        const stockQty = Math.trunc(Number(row.stock_qty));
        const purchaseQtyTotal = Math.trunc(
          Number(row.purchase_qty_total ?? row.stock_qty)
        );
        const purchaseValueTotal = Number(row.purchase_value_total ?? 0);

        // 와인 생성 (unique constraint 위반 시 기존 와인 찾기)
        let wineId: string;

        let existingWineQuery = supabase
          .from("wines")
          .select("id")
          .eq("house_id", houseId)
          .eq("producer", producer)
          .eq("name", name);

        if (vintage === null)
          existingWineQuery = existingWineQuery.is("vintage", null);
        else existingWineQuery = existingWineQuery.eq("vintage", vintage);

        const existingWine = await existingWineQuery.maybeSingle();

        if (existingWine.data) {
          wineId = existingWine.data.id;
        } else {
          // purchase 추가 시 trigger에 의해 stock_qty가 증가하므로, 초기값은 0으로 설정
          const created = await supabase
            .from("wines")
            .insert({
              house_id: houseId,
              producer,
              name,
              vintage,
              country,
              region,
              type,
              stock_qty: 0, // purchase 추가 시 trigger에 의해 증가
              purchase_qty_total: purchaseQtyTotal,
              purchase_value_total: purchaseValueTotal,
              avg_purchase_price:
                purchaseQtyTotal > 0
                  ? purchaseValueTotal / purchaseQtyTotal
                  : 0,
            })
            .select("id")
            .single();

          if (created.error || !created.data) {
            logger.error("[importWines] Wine creation failed", {
              error: created.error,
              row,
            });
            errorCount++;
            continue;
          }

          wineId = created.data.id;
        }

        // 구매 기록 생성 (unit_price = purchase_value_total / purchase_qty_total)
        const unitPrice =
          purchaseQtyTotal > 0 ? purchaseValueTotal / purchaseQtyTotal : 0;
        const purchasedAt = row.purchased_at
          ? String(row.purchased_at).trim() || undefined
          : undefined;
        const store = row.store ? String(row.store).trim() : "Import";

        const purchaseInsert = await supabase.from("purchases").insert({
          house_id: houseId,
          wine_id: wineId,
          unit_price: unitPrice,
          quantity: purchaseQtyTotal,
          purchased_at: purchasedAt,
          store,
        });

        if (purchaseInsert.error) {
          logger.error("[importWines] Purchase creation failed", {
            error: purchaseInsert.error,
            row,
          });
          errorCount++;
          continue;
        }

        successCount++;
      } catch (e) {
        logger.error("[importWines] Error processing row", { error: e, row });
        errorCount++;
      }
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
