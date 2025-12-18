import { ActionButton } from "@/components/action-button";
import { Layout } from "@/components/layout";
import { Card, Input } from "@/components/ui";
import { logger } from "@/lib/logger";

import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{
    error?: string;
    notice?: string;
    redirect?: string;
  }>;
}) {
  const params = (await searchParams) ?? {};
  const error = params.error;
  const notice = params.notice;
  const redirect = params.redirect;

  logger.log("params", params);
  logger.log(error, notice, redirect);

  return (
    <Layout
      title={
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 font-extrabold mb-0.5">
            Wine Log
          </span>
          <span className="text-xl font-serif text-stone-800">로그인</span>
        </div>
      }
    >
      <div className="px-5 pt-6">
        <Card className="animate-fade-in-up">
          <p className="text-sm text-stone-600 font-medium mb-4 leading-6">
            이메일/비밀번호로 로그인하세요. 가족 공유는 로그인 후 “초대 링크”로
            초대합니다.
          </p>

          {notice === "check-email" ? (
            <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-800">
              가입이 완료되었어요. 설정에 따라 이메일 확인이 필요할 수 있어요.
            </div>
          ) : null}

          {error ? (
            <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {decodeURIComponent(error)}
            </div>
          ) : null}

          <form className="space-y-1">
            {redirect ? (
              <input type="hidden" name="redirect" value={redirect} />
            ) : null}
            <Input label="이메일" name="email" type="email" required />
            <Input label="비밀번호" name="password" type="password" required />
            <div className="pt-2 flex gap-3">
              <ActionButton
                className="flex-1"
                formAction={login}
                pendingText="로그인 중..."
              >
                로그인
              </ActionButton>
              <ActionButton
                className="flex-1"
                variant="secondary"
                formAction={signup}
                pendingText="가입 중..."
              >
                가입
              </ActionButton>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
