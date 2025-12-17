import { redirect } from "next/navigation";

import { Layout } from "@/components/layout";
import { Button, Card, Input } from "@/components/ui";
import { getFlash } from "@/lib/flash";
import { createClient } from "@/lib/supabase/server";

import { createHouse } from "./actions";

export default async function AppPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) redirect("/login");
  const flash = await getFlash();

  const houses = await supabase
    .from("houses")
    .select("id,name,created_at")
    .order("created_at", { ascending: false });

  return (
    <Layout
      title={
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 font-extrabold mb-0.5">
            My Cellars
          </span>
          <span className="text-xl font-serif text-stone-800">하우스 선택</span>
        </div>
      }
      actions={
        <form action="/auth/signout" method="post">
          <button
            className="p-2.5 rounded-full hover:bg-stone-100 transition-colors text-stone-500"
            title="로그아웃"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M7.5 3.75A3.75 3.75 0 003.75 7.5v9A3.75 3.75 0 007.5 20.25h6a.75.75 0 000-1.5h-6A2.25 2.25 0 015.25 16.5v-9A2.25 2.25 0 017.5 5.25h6a.75.75 0 000-1.5h-6zm9.22 4.97a.75.75 0 011.06 0l2.47 2.47a.75.75 0 010 1.06l-2.47 2.47a.75.75 0 11-1.06-1.06l1.19-1.19H10.5a.75.75 0 010-1.5h7.41l-1.19-1.19a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </form>
      }
    >
      <div className="px-5 pt-6 space-y-6">
        {flash?.kind === "error" ? (
          <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {flash.message}
          </div>
        ) : null}

        <Card className="animate-fade-in-up">
          <h2 className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest mb-4">
            내 하우스
          </h2>

          {houses.error ? (
            <p className="text-sm text-red-600">{houses.error.message}</p>
          ) : houses.data?.length ? (
            <div className="space-y-3">
              {houses.data.map((house) => (
                <a
                  key={house.id}
                  href={`/h/${house.id}/cellar`}
                  className="block rounded-2xl bg-white border border-stone-100 px-4 py-4 hover:border-stone-200 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-stone-800 truncate">
                        {house.name ?? "이름 없는 하우스"}
                      </div>
                      <div className="text-xs text-stone-400 font-bold mt-1">
                        {new Date(house.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-stone-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.5 6.75a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l4.72-4.72-4.72-4.72a.75.75 0 010-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-sm text-stone-500 font-medium">
              아직 하우스가 없어요. 아래에서 새로 만들어보세요.
            </div>
          )}
        </Card>

        <Card className="animate-fade-in-up">
          <h2 className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest mb-4">
            새 하우스 만들기
          </h2>
          <form>
            <Input
              label="하우스 이름(선택)"
              name="name"
              placeholder="예: 우리집 셀러"
            />
            <Button fullWidth formAction={createHouse}>
              만들기
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}


