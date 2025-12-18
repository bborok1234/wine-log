"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui";

interface Props {
  invitePath: string;
}

export function InviteLinkDisplay({ invitePath }: Props) {
  const fullUrl = useMemo(() => {
    if (invitePath.startsWith("http")) return invitePath;
    if (typeof window !== "undefined") {
      return `${window.location.origin}${invitePath}`;
    }
    return invitePath;
  }, [invitePath]);

  const [isCopying, setIsCopying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  async function handleCopy() {
    if (isCopying) return;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch {
      // noop
    } finally {
      setIsCopying(false);
    }
  }

  async function handleShare() {
    if (isSharing) return;
    setIsSharing(true);
    if (navigator.share) {
      try {
        await navigator.share({ url: fullUrl, title: "Wine Cellar 초대 링크" });
      } catch {
        // user cancelled or unsupported
      }
      setIsSharing(false);
      return;
    }
    await handleCopy();
    setIsSharing(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone-100 bg-white/70 p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-stone-400">
          Invite Link
        </div>
        <div className="h-px flex-1 bg-stone-200" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-stone-800 break-all line-clamp-2">
            {fullUrl}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            링크를 복사하거나 공유하세요.
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="secondary"
            className="!py-2.5 !px-4"
            onClick={() => void handleCopy()}
            loading={isCopying}
            disabled={isSharing}
          >
            복사
          </Button>
          <Button
            className="!py-2.5 !px-4"
            onClick={() => void handleShare()}
            loading={isSharing}
            disabled={isCopying}
          >
            공유
          </Button>
        </div>
      </div>
    </div>
  );
}
