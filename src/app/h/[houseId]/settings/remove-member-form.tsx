"use client";

import { useCallback } from "react";

import { Button } from "@/components/ui";

interface RemoveMemberFormProps {
  houseId: string;
  userId: string;
  removeMember: (formData: FormData) => void | Promise<void>;
}

export function RemoveMemberForm({
  houseId,
  userId,
  removeMember,
}: RemoveMemberFormProps) {
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    const ok = window.confirm("정말 이 멤버를 삭제할까요?");
    if (ok) return;
    e.preventDefault();
  }, []);

  return (
    <form action={removeMember} onSubmit={handleSubmit}>
      <input type="hidden" name="houseId" value={houseId} />
      <input type="hidden" name="userId" value={userId} />
      <Button
        type="submit"
        variant="secondary"
        className="!py-2 !px-3 !text-xs"
      >
        삭제
      </Button>
    </form>
  );
}
