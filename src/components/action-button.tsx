"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui";

interface ActionButtonProps extends ComponentProps<typeof Button> {
  pendingText?: ReactNode;
}

export function ActionButton({
  children,
  loading,
  disabled,
  pendingText,
  ...props
}: ActionButtonProps) {
  const { pending } = useFormStatus();
  const isPending = pending || Boolean(loading);

  return (
    <Button {...props} loading={isPending} disabled={disabled || isPending}>
      {isPending && pendingText ? pendingText : children}
    </Button>
  );
}
