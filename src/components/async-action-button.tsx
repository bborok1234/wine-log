"use client";

import type { ComponentProps, ReactNode } from "react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui";

interface AsyncActionButtonProps
  extends Omit<ComponentProps<typeof Button>, "onClick"> {
  onClick: () => Promise<void> | void;
  pendingText?: ReactNode;
}

export function AsyncActionButton({
  onClick,
  children,
  pendingText,
  disabled,
  loading,
  ...props
}: AsyncActionButtonProps) {
  const [isRunning, setIsRunning] = useState(false);

  const handleClick = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    try {
      await onClick();
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, onClick]);

  const isPending = Boolean(loading) || isRunning;

  return (
    <Button
      {...props}
      onClick={() => void handleClick()}
      loading={isPending}
      disabled={disabled || isPending}
    >
      {isPending && pendingText ? pendingText : children}
    </Button>
  );
}
