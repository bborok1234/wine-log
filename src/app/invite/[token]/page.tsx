"use client";

import { useEffect, useState } from "react";

import { Layout } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/client";

// 이 페이지는 public 접근 가능 (auth guard 없음)

interface AcceptState {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  houseId?: string;
}

export default function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }> | { token: string };
}) {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<AcceptState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const resolved = "then" in params ? await params : params;
      if (cancelled) return;
      const tokenValue = resolved.token;
      logger.log("Token resolved:", tokenValue);
      setToken(tokenValue);
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [params]);

  useEffect(() => {
    if (!token) {
      logger.log("Token is null, waiting...");
      return;
    }
    let cancelled = false;
    async function accept() {
      logger.log("Invite page: Starting accept flow, token:", token);
      setState({ status: "loading" });
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      logger.log("Invite page: Session check result:", !!session);

      if (!session) {
        const redirectPath = `/invite/${token}`;
        const redirectUrl = `/login?redirect=${encodeURIComponent(
          redirectPath
        )}`;
        logger.log("Invite page: No session, redirecting to:", redirectUrl);
        window.location.href = redirectUrl;
        return;
      }

      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json().catch(() => ({}));
      if (cancelled) return;
      if (!res.ok || json.error) {
        setState({
          status: "error",
          message: json.error || "초대 수락에 실패했어요.",
        });
        return;
      }
      setState({ status: "success", houseId: json.data?.houseId });
      if (json.data?.houseId) {
        window.location.href = `/h/${json.data.houseId}/cellar`;
      }
    }
    void accept();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <Layout backHref="/app" title="초대 수락">
      <div className="px-5 pt-6 pb-20">
        <Card className="space-y-4 text-center">
          {state.status === "loading" ? (
            <>
              <div className="text-lg font-semibold text-stone-800">
                초대를 확인 중이에요...
              </div>
              <div className="text-sm text-stone-500">잠시만 기다려주세요.</div>
            </>
          ) : state.status === "success" ? (
            <>
              <div className="text-lg font-semibold text-emerald-600">
                초대가 수락되었어요!
              </div>
              <div className="text-sm text-stone-500">곧 이동합니다...</div>
            </>
          ) : (
            <>
              <div className="text-lg font-semibold text-red-600">
                초대 수락에 실패했어요
              </div>
              <div className="text-sm text-stone-500">
                {state.message ?? "유효하지 않은 초대예요."}
              </div>
              <Button
                className="!mt-2"
                onClick={() => (window.location.href = "/app")}
              >
                홈으로
              </Button>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}
