"use server";

import { redirect } from "next/navigation";

import { setFlash } from "@/lib/flash";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createHouse(formData: FormData) {
  const name = getString(formData, "name") || null;

  const supabase = await createClient();

  // IMPORTANT: getClaims()는 “검증된 로그인 여부” 확인용.
  const { data: claimsData } = await supabase.auth.getClaims();
  const claimSub = (claimsData?.claims as Record<string, unknown> | null)?.sub;
  const userId = typeof claimSub === "string" ? claimSub : null;

  if (!userId) {
    await setFlash({
      kind: "error",
      message: "세션을 확인할 수 없어요. 다시 로그인 해주세요.",
    });
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("houses")
    // created_by 기본값/평가 타이밍 이슈를 배제하기 위해 명시적으로 넣는다.
    .insert({ name, created_by: userId })
    .select("id")
    .single();

  if (error || !data) {
    // 서버 로그로 원인 추적(쿠키/세션/권한 문제)
    console.error("[createHouse] insert failed", {
      error: error?.message,
      hasClaims: !!claimsData?.claims,
      userId,
    });
    await setFlash({
      kind: "error",
      message: error?.message ?? "하우스를 만들 수 없어요.",
    });
    redirect("/app");
  }
  redirect(`/h/${data.id}/cellar`);
}
