import Link from "next/link";

import { Layout } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import { getFlash } from "@/lib/flash";
import { requireAuthedUser, requireHouseAccess } from "@/lib/house";
import { createClient } from "@/lib/supabase/server";

import { ImportForm } from "./import-form";
import { InviteLinkDisplay } from "./invite-link-display";
import { RemoveMemberForm } from "./remove-member-form";
import { createInvite, removeMember, updateProfile } from "./server-actions";

function formatMemberId(userId: string) {
  if (!userId) return "-";
  if (userId.length <= 12) return userId;
  return `${userId.slice(0, 6)}…${userId.slice(-4)}`;
}

function roleLabel(role: string) {
  if (role === "owner") return "owner";
  if (role === "editor") return "editor";
  if (role === "viewer") return "viewer";
  return role;
}

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ houseId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { houseId } = await params;
  const flash = await getFlash();
  const query = (await searchParams) ?? {};
  const invitePath =
    typeof query.invitePath === "string" ? query.invitePath : null;
  const isProfileSaved = query.profileSaved === "1";
  const isMemberRemoved = query.memberRemoved === "1";

  const supabase = await createClient();
  await requireAuthedUser(supabase);
  const house = await requireHouseAccess(supabase, houseId);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 마이그레이션 이전 가입자(backfill) 안전장치:
  // settings 진입 시 내 profiles row가 없으면 생성해서
  // - 프로필 저장(update) 대상이 0 rows가 되는 문제
  // - Joined 표시가 "-"로만 나오는 문제
  // 를 방지한다.
  if (user) {
    const existing = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (!existing.data) {
      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email ?? null,
        joined_at: user.created_at ?? new Date().toISOString(),
      });
    }
  }

  const myMember = user
    ? await supabase
        .from("house_members")
        .select("role")
        .eq("house_id", houseId)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null, error: null as null | { message: string } };

  const isOwner = myMember.data?.role === "owner";

  const members = await supabase
    .from("house_members")
    .select("user_id,role,created_at")
    .eq("house_id", houseId)
    .order("created_at", { ascending: true });

  const memberUserIds = (members.data ?? []).map((m) => m.user_id);
  const profiles =
    memberUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id,email,nickname,joined_at")
          .in("id", memberUserIds)
      : { data: [], error: null as null | { message: string } };

  const profileById = new Map(
    (profiles.data ?? []).map((p) => [p.id, p] as const)
  );

  const myProfile = user
    ? await supabase
        .from("profiles")
        .select("id,email,nickname,joined_at")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null, error: null as null | { message: string } };

  return (
    <Layout backHref={`/h/${houseId}/cellar`} title="설정 및 관리">
      <div className="p-5 space-y-6">
        {flash?.kind === "error" ? (
          <div className="rounded-2xl px-4 py-3 text-sm border bg-red-50 border-red-100 text-red-700">
            {flash.message}
          </div>
        ) : null}
        {flash?.kind === "success" ? (
          <div className="rounded-2xl px-4 py-3 text-sm border bg-green-50 border-green-100 text-green-700">
            {flash.message}
          </div>
        ) : null}

        <section>
          <h3 className="text-lg font-bold text-stone-800 mb-3 px-1">프로필</h3>
          <Card className="space-y-4">
            <div>
              <p className="font-bold text-stone-800 mb-1">내 계정</p>
              <p className="text-sm text-stone-500">
                이메일은 로그인 계정 기준으로 표시돼요.
              </p>
            </div>

            <form
              action={updateProfile}
              className="pt-4 border-t border-stone-100 space-y-3"
            >
              <input type="hidden" name="houseId" value={houseId} />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-stone-50 border border-stone-100 px-4 py-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
                    Email
                  </div>
                  <div className="mt-1 text-sm font-bold text-stone-800 break-all">
                    {myProfile.data?.email ?? user?.email ?? "-"}
                  </div>
                </div>
                <div className="rounded-2xl bg-stone-50 border border-stone-100 px-4 py-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
                    Joined
                  </div>
                  <div className="mt-1 text-sm font-bold text-stone-800">
                    {myProfile.data?.joined_at
                      ? new Intl.DateTimeFormat("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        }).format(new Date(myProfile.data.joined_at))
                      : "-"}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/70 border border-stone-100 p-3 shadow-sm">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-stone-400 mb-2">
                  Nickname
                </div>
                <input
                  name="nickname"
                  defaultValue={myProfile.data?.nickname ?? ""}
                  placeholder="닉네임(선택)"
                  className="w-full px-5 py-3.5 bg-stone-50 border border-transparent rounded-2xl text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-wine-200 focus:ring-4 focus:ring-wine-50 transition-all duration-300 shadow-inner"
                />
              </div>

              <Button type="submit" className="!py-2.5 !px-4">
                프로필 저장
              </Button>

              {isProfileSaved ? (
                <div className="flex items-center justify-between gap-3 text-sm text-stone-600">
                  <span className="font-semibold">저장 완료</span>
                  <Link
                    href={`/h/${houseId}/settings`}
                    className="text-xs font-bold text-stone-400 hover:text-stone-600"
                  >
                    닫기
                  </Link>
                </div>
              ) : null}
            </form>
          </Card>
        </section>

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
              <p className="font-bold text-stone-800 mb-1">멤버</p>
              <p className="text-sm text-stone-500">
                현재 하우스에 참여 중인 멤버와 권한을 확인할 수 있어요.
              </p>

              {isMemberRemoved ? (
                <div className="flex items-center justify-between gap-3 text-sm text-stone-600">
                  <span className="font-semibold">멤버를 삭제했어요.</span>
                  <Link
                    href={`/h/${houseId}/settings`}
                    className="text-xs font-bold text-stone-400 hover:text-stone-600"
                  >
                    닫기
                  </Link>
                </div>
              ) : null}

              {members.error ? (
                <div className="text-sm text-red-600">
                  {members.error.message}
                </div>
              ) : (
                <div className="space-y-2">
                  {(members.data ?? []).map((m) => {
                    const isMe = user?.id === m.user_id;
                    const canDelete = isOwner && !isMe;
                    const p = profileById.get(m.user_id);
                    const displayName =
                      p?.nickname?.trim() ||
                      p?.email?.trim() ||
                      (isMe ? "나" : formatMemberId(m.user_id));
                    return (
                      <div
                        key={m.user_id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-stone-100 bg-white/70 px-4 py-3 shadow-sm"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-stone-900 truncate">
                            {displayName}
                          </div>
                          <div className="text-xs text-stone-500 mt-0.5">
                            role:{" "}
                            <span className="font-bold text-stone-700">
                              {roleLabel(m.role)}
                            </span>
                            {p?.email ? (
                              <>
                                {" "}
                                <span className="text-stone-300">·</span>{" "}
                                <span className="font-semibold text-stone-500">
                                  {p.email}
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {m.role === "owner" ? (
                            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-stone-900 text-white px-2 py-1 rounded-full">
                              OWNER
                            </span>
                          ) : m.role === "editor" ? (
                            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-full">
                              EDITOR
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-stone-50 text-stone-600 border border-stone-100 px-2 py-1 rounded-full">
                              VIEWER
                            </span>
                          )}

                          {canDelete ? (
                            <RemoveMemberForm
                              houseId={houseId}
                              userId={m.user_id}
                              removeMember={removeMember}
                            />
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 border-t border-stone-100 space-y-3">
                <p className="font-bold text-stone-800 mb-1">멤버 추가</p>
                <p className="text-sm text-stone-500">
                  {isOwner
                    ? "초대 링크를 만들어 공유하세요."
                    : "소유자(owner)만 초대 링크를 만들 수 있어요."}
                </p>

                {invitePath ? (
                  <div className="space-y-2">
                    <InviteLinkDisplay invitePath={invitePath} />
                    <div className="flex justify-end">
                      <Link
                        href={`/h/${houseId}/settings`}
                        className="text-xs font-bold text-stone-400 hover:text-stone-600"
                      >
                        닫기
                      </Link>
                    </div>
                  </div>
                ) : isOwner ? (
                  <form action={createInvite} className="space-y-2">
                    <input type="hidden" name="houseId" value={houseId} />
                    <Button type="submit" className="!py-2.5 !px-4">
                      초대 생성
                    </Button>
                  </form>
                ) : null}
              </div>
            </div>
          </Card>
        </section>

        <section>
          <h3 className="text-lg font-bold text-stone-800 mb-3 px-1">
            데이터 관리
          </h3>
          <Card className="space-y-4">
            <div>
              <p className="font-bold text-stone-800 mb-1">데이터 내보내기</p>
              <p className="text-sm text-stone-500 mb-3">
                현재 하우스의 모든 와인 데이터를 엑셀 파일로 다운로드합니다.
                (재고가 있는 와인만 포함됩니다)
              </p>
              <a href={`/api/h/${houseId}/export`}>
                <Button variant="secondary" fullWidth className="!py-2.5">
                  엑셀 파일 다운로드
                </Button>
              </a>
            </div>
            <div className="pt-4 border-t border-stone-100">
              <p className="font-bold text-stone-800 mb-1">데이터 가져오기</p>
              <p className="text-sm text-stone-500 mb-3">
                엑셀 또는 CSV 파일을 업로드하여 와인 데이터를 가져옵니다. 재고가
                0인 항목은 자동으로 건너뜁니다.
              </p>
              <ImportForm houseId={houseId} />
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
