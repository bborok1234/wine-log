"use client";

import { useMemo, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectFieldOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  options: SelectFieldOption[];
  onValueChange?: (value: string) => void;
  triggerClassName?: string;
  contentClassName?: string;
}

function isControlled(value: SelectFieldProps["value"]) {
  return typeof value === "string";
}

export function SelectField({
  label,
  name,
  value,
  defaultValue,
  placeholder = "선택",
  options,
  onValueChange,
  triggerClassName,
  contentClassName,
}: SelectFieldProps) {
  const initial = useMemo(() => {
    if (typeof defaultValue === "string") return defaultValue;
    return options[0]?.value ?? "";
  }, [defaultValue, options]);

  const [internalValue, setInternalValue] = useState(() => initial);
  const currentValue = isControlled(value) ? value : internalValue;

  return (
    <div className="mb-5 group">
      {label ? (
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-wine-600 transition-colors">
          {label}
        </label>
      ) : null}

      {name ? <input type="hidden" name={name} value={currentValue} /> : null}

      <Select
        value={currentValue}
        onValueChange={(next) => {
          if (!isControlled(value)) setInternalValue(next);
          onValueChange?.(next);
        }}
      >
        <SelectTrigger
          className={[
            // shadcn 기본 Trigger 스타일을 Input 스타일로 강제 통일
            "!w-full !justify-between",
            "!rounded-2xl !border !border-transparent !bg-stone-50 !shadow-inner",
            "!px-5 !py-3.5",
            "!text-stone-800",
            "focus:!bg-white focus:!outline-none focus:!border-wine-200 focus:!ring-4 focus:!ring-wine-50",
            "transition-all duration-300",
            // Trigger 컴포넌트의 고정 높이 제거
            "data-[size=default]:!h-auto data-[size=sm]:!h-auto",
            triggerClassName ?? "",
          ].join(" ")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={contentClassName}>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
