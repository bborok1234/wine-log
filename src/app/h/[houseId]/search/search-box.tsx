"use client";

import { useQueryState } from "nuqs";

import { Input } from "@/components/ui";

interface SearchBoxProps {
  placeholder?: string;
  inputClassName?: string;
}

export function SearchBox({
  placeholder = "이름, 지역, 생산자, 국가 검색...",
  inputClassName,
}: SearchBoxProps) {
  const [q, setQ] = useQueryState("q", { defaultValue: "" });

  return (
    <div className="relative">
      <Input
        className={["!pl-12", inputClassName ?? ""].join(" ")}
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <svg
        className="w-5 h-5 text-stone-400 absolute left-4 top-[14px]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    </div>
  );
}


