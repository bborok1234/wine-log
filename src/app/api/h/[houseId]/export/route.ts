import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { requireAuthedUser, requireHouseAccess } from "@/lib/house";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ houseId: string }> }
) {
  const { houseId } = await params;
  const supabase = await createClient();
  await requireAuthedUser(supabase);
  await requireHouseAccess(supabase, houseId);

  // 모든 와인 조회 (재고가 0보다 큰 것만)
  const winesResult = await supabase
    .from("wines")
    .select(
      "id,producer,name,vintage,country,region,type,stock_qty,purchase_qty_total,purchase_value_total"
    )
    .eq("house_id", houseId)
    .gt("stock_qty", 0)
    .order("producer");

  if (winesResult.error) {
    return NextResponse.json(
      { error: winesResult.error.message },
      { status: 500 }
    );
  }

  const wines = winesResult.data ?? [];

  // JavaScript에서 정렬 (producer > name > vintage)
  wines.sort((a, b) => {
    if (a.producer !== b.producer) {
      return a.producer.localeCompare(b.producer);
    }
    if (a.name !== b.name) {
      return a.name.localeCompare(b.name);
    }
    // vintage 정렬: null은 숫자보다 뒤에 오도록 처리
    if (a.vintage === null && b.vintage === null) {
      return 0;
    }
    if (a.vintage === null) {
      return 1; // null은 뒤로
    }
    if (b.vintage === null) {
      return -1; // null은 뒤로
    }
    return a.vintage - b.vintage;
  });

  // 각 와인의 가장 최근 구매 기록 조회
  const winesWithPurchases = await Promise.all(
    wines.map(async (wine) => {
      const purchaseResult = await supabase
        .from("purchases")
        .select("purchased_at,store")
        .eq("wine_id", wine.id)
        .order("purchased_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        producer: wine.producer,
        name: wine.name,
        vintage: wine.vintage,
        country: wine.country ?? "",
        region: wine.region ?? "",
        type: wine.type ?? "",
        stock_qty: wine.stock_qty,
        purchase_qty_total: wine.purchase_qty_total,
        purchase_value_total: wine.purchase_value_total,
        purchased_at: purchaseResult.data?.purchased_at ?? "",
        store: purchaseResult.data?.store ?? "",
      };
    })
  );

  // 엑셀 워크북 생성
  const worksheet = XLSX.utils.json_to_sheet(winesWithPurchases);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "와인 목록");

  // 버퍼로 변환
  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="wine-export-${Date.now()}.xlsx"`,
    },
  });
}
