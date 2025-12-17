import { Layout } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import { getFlash } from "@/lib/flash";
import { requireAuthedUser, requireHouseAccess } from "@/lib/house";
import { createClient } from "@/lib/supabase/server";

import { InviteLinkDisplay } from "./invite-link-display";
import { createInvite } from "./server-actions";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ houseId: string }>;
}) {
  const { houseId } = await params;
  const flash = await getFlash();

  const supabase = await createClient();
  await requireAuthedUser(supabase);
  const house = await requireHouseAccess(supabase, houseId);

  return (
    <Layout backHref={`/h/${houseId}/cellar`} title="설정 및 관리">
      <div className="p-5 space-y-6">
        {flash?.kind === "error" ? (
          <div className="rounded-2xl px-4 py-3 text-sm border bg-red-50 border-red-100 text-red-700">
            {flash.message}
          </div>
        ) : null}

        <section>
          <h3 className="text-lg font-bold text-stone-800 mb-3 px-1">하우스</h3>
          <Card className="space-y-4">
            <div>
              <p className="font-bold text-stone-800 mb-1">현재 하우스</p>
              <p className="text-sm text-stone-500">
                {house.name ?? "이름 없음"}{" "}
                <span className="text-stone-300">·</span> {houseId}
              </p>
            </div>
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <p className="font-bold text-stone-800 mb-1">초대 링크</p>
              <p className="text-sm text-stone-500">
                기본 역할: editor · 만료: 없음 · 생성 후 바로 복사해서
                공유하세요.
              </p>
              {flash?.kind === "success" ? (
                <InviteLinkDisplay invitePath={flash.message} />
              ) : (
                <form action={createInvite} className="space-y-2">
                  <input type="hidden" name="houseId" value={houseId} />
                  <div className="flex gap-2">
                    <Button type="submit" className="!py-2.5 !px-4">
                      초대 생성
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </section>

        <section>
          <h3 className="text-lg font-bold text-stone-800 mb-3 px-1">계정</h3>
          <Card className="space-y-4">
            <div>
              <p className="font-bold text-stone-800 mb-1">로그아웃</p>
              <p className="text-sm text-stone-500 mb-3">
                현재 계정에서 로그아웃합니다.
              </p>
              <a href="/auth/signout">
                <Button variant="secondary" fullWidth className="!py-2.5">
                  로그아웃
                </Button>
              </a>
            </div>
          </Card>
        </section>

        <section>
          <h3 className="text-lg font-bold text-stone-800 mb-3 px-1">
            앱 정보
          </h3>
          <Card className="text-center py-6">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
              🍷
            </div>
            <h4 className="font-bold text-stone-900">wine-log</h4>
            <p className="text-xs text-stone-400 mt-1">
              Version 1 (Next.js + Supabase)
            </p>
            <p className="text-sm text-stone-500 mt-4">
              부부/가족이 함께 쓰는
              <br />
              스마트한 와인 셀러
            </p>
          </Card>
        </section>
      </div>
    </Layout>
  );
}
