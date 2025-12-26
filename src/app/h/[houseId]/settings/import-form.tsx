"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui";

import { importWines } from "./server-actions";

export function ImportForm({ houseId }: { houseId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await importWines(formData);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input type="hidden" name="houseId" value={houseId} />
      <input
        type="file"
        name="file"
        accept=".xlsx,.xls,.csv"
        required
        disabled={isLoading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          setFileName(file?.name ?? "");
        }}
        className="block w-full text-sm text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {fileName && !isLoading && (
        <p className="text-xs text-stone-500 px-1">선택된 파일: {fileName}</p>
      )}
      <Button type="submit" fullWidth className="!py-2.5" loading={isLoading}>
        {isLoading ? "가져오는 중..." : "파일 업로드 및 가져오기"}
      </Button>
      {isLoading && (
        <p className="text-xs text-stone-400 px-1 text-center animate-pulse">
          파일을 처리하고 있습니다. 잠시만 기다려주세요...
        </p>
      )}
    </form>
  );
}

