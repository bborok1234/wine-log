"use client";

import { ReactNode, useState } from "react";

import { Button } from "@/components/ui";

interface Props {
  houseId: string;
  wineId: string;
  producer: string;
  name: string | null;
  disabled: boolean;
  formAction: (formData: FormData) => void | Promise<void>;
  triggerClassName?: string;
  triggerContent?: ReactNode;
  fullWidth?: boolean;
}

export function ConsumeWineModal({
  houseId,
  wineId,
  producer,
  name,
  disabled,
  formAction,
  triggerClassName,
  triggerContent,
  fullWidth = true,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  return (
    <>
      <Button
        fullWidth={fullWidth}
        className={triggerClassName}
        variant={disabled ? "secondary" : "primary"}
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        {triggerContent ?? (disabled ? "재고 없음" : "한 병 마시기 🥂")}
      </Button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-5 bg-stone-900/20 backdrop-blur-md animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="glass-card bg-white/90 rounded-[32px] p-6 w-full max-w-xs shadow-2xl animate-scale-in border border-white/60"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-wine-100 to-pink-100 text-wine-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
                🥂
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">
                한 병 마실까요?
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                <span className="font-bold text-stone-800 text-base">
                  {producer}
                </span>
                <br />
                <span className="text-stone-500">{name}</span>
                <br />
                <br />
                보유 재고에서 1병이 차감됩니다.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                type="button"
                onClick={() => setIsOpen(false)}
              >
                취소
              </Button>
              <form
                className="w-full"
                onSubmit={async () => {
                  setSubmitting(true);
                  try {
                    const fd = new FormData();
                    fd.append("houseId", houseId);
                    fd.append("wineId", wineId);
                    await formAction(fd);
                    setIsOpen(false);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                <input type="hidden" name="houseId" value={houseId} />
                <input type="hidden" name="wineId" value={wineId} />
                <Button
                  fullWidth
                  type="submit"
                  loading={submitting}
                >
                  확인
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
