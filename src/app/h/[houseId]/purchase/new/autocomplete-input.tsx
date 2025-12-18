"use client";

import { useMemo, useRef, useState } from "react";

interface AutocompleteInputProps {
  label: string;
  id: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  suggestions: string[];
  placeholder?: string;
  maxItems?: number;
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

export function AutocompleteInput({
  label,
  id,
  name,
  defaultValue,
  required,
  suggestions,
  placeholder,
  maxItems = 10,
}: AutocompleteInputProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const items = useMemo(() => {
    const q = normalizeQuery(value);
    if (!q) return [];
    return suggestions
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, maxItems);
  }, [value, suggestions, maxItems]);

  const shouldShow = isOpen && value.trim().length > 0 && items.length > 0;

  return (
    <div
      ref={rootRef}
      className="mb-5 group relative"
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null;
        if (next && rootRef.current?.contains(next)) return;
        setIsOpen(false);
      }}
    >
      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-wine-600 transition-colors">
        {label}
      </label>

      <input
        id={id}
        name={name}
        required={required}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        className="w-full px-5 py-3.5 bg-stone-50 border border-transparent rounded-2xl text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-wine-200 focus:ring-4 focus:ring-wine-50 transition-all duration-300 shadow-inner"
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          setValue(e.target.value);
          setIsOpen(true);
        }}
      />

      {shouldShow ? (
        <div className="absolute left-0 right-0 top-full mt-2 z-50">
          <div className="rounded-2xl bg-white border border-stone-200 shadow-xl overflow-hidden">
            <div className="max-h-64 overflow-auto no-scrollbar py-1">
              {items.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="w-full text-left px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-50 focus:bg-stone-50 focus:outline-none"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setValue(item);
                    setIsOpen(false);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
