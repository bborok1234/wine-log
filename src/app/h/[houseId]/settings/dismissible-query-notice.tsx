"use client";

import { useQueryState } from "nuqs";
import { useState } from "react";

interface DismissibleQueryNoticeProps {
  label?: string;
  queryKey: string;
}

export function DismissibleQueryNotice({
  label,
  queryKey,
}: DismissibleQueryNoticeProps) {
  const [, setValue] = useQueryState(queryKey, { shallow: true });
  const [isHidden, setIsHidden] = useState(false);

  if (isHidden) return null;

  return (
    <div className="flex items-center justify-between gap-3 text-sm text-stone-600">
      <span className="font-semibold">{label ?? ""}</span>
      <button
        type="button"
        onClick={() => {
          setIsHidden(true);
          // URL만 정리(shallow)하고 서버 재렌더는 피한다
          void setValue(null);
        }}
        className="text-xs font-bold text-stone-400 hover:text-stone-600"
      >
        닫기
      </button>
    </div>
  );
}
