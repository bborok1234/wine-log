"use client";

import NextImage from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

interface ParsedWine {
  producer: string | null;
  name: string | null;
  vintage: number | null;
  country: string | null;
  region: string | null;
  type:
    | "red"
    | "white"
    | "sparkling"
    | "rose"
    | "dessert"
    | "fortified"
    | "other"
    | null;
}

async function postJson<T>(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as unknown;
  const error =
    typeof json === "object" && json && "error" in json
      ? (json as { error?: unknown }).error
      : null;
  const data =
    typeof json === "object" && json && "data" in json
      ? (json as { data?: unknown }).data
      : null;
  if (!res.ok)
    throw new Error(typeof error === "string" ? error : "요청에 실패했어요.");
  return data as T;
}

function setInputValue(id: string, value: string) {
  const el = document.getElementById(id);
  if (el && el instanceof HTMLInputElement) el.value = value;
  if (el && el instanceof HTMLTextAreaElement) el.value = value;
  if (el && el instanceof HTMLSelectElement) el.value = value;
}

function readTextAreaValue(id: string) {
  const el = document.getElementById(id);
  if (el && el instanceof HTMLTextAreaElement) return el.value;
  return "";
}

async function processImage(file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const imageEl = new window.Image();
    imageEl.onload = () => resolve(imageEl);
    imageEl.onerror = reject;
    imageEl.src = dataUrl;
  });

  // 빈티지(작은 숫자) 인식이 잘 되도록 해상도/품질을 조금 올림
  const MAX = 1200;
  let width = img.width;
  let height = img.height;

  if (width > height) {
    if (width > MAX) {
      height = Math.round((height * MAX) / width);
      width = MAX;
    }
  } else if (height > MAX) {
    width = Math.round((width * MAX) / height);
    height = MAX;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", 0.7);
}

export function AiWineAutofill({
  initialText,
  houseId,
}: {
  initialText: string;
  houseId: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [labelPath, setLabelPath] = useState<string | null>(null);

  const textareaId = "ai-raw-input";
  const producerId = "ai-producer";
  const nameId = "ai-name";
  const vintageId = "ai-vintage";
  const countryId = "ai-country";
  const regionId = "ai-region";
  const typeId = "ai-type";

  const hasPreview = useMemo(() => !!preview, [preview]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function base64ToBlob(base64: string, mimeType: string): Blob {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: mimeType });
  }

  function applyParsed(parsed: ParsedWine) {
    if (parsed.producer) setInputValue(producerId, parsed.producer);
    if (parsed.name) setInputValue(nameId, parsed.name);
    if (typeof parsed.vintage === "number")
      setInputValue(vintageId, String(parsed.vintage));
    if (parsed.country) setInputValue(countryId, parsed.country);
    if (parsed.region) setInputValue(regionId, parsed.region);
    if (parsed.type) setInputValue(typeId, parsed.type);
  }

  async function handleAutoFillFromText() {
    setErrorMessage(null);
    setIsParsing(true);
    try {
      const text = readTextAreaValue(textareaId).trim();
      const data = await postJson<ParsedWine>("/api/ai/parse-wine", { text });
      applyParsed(data);
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : "AI 분석에 실패했습니다."
      );
    } finally {
      setIsParsing(false);
    }
  }

  async function handlePickImage(file: File) {
    setErrorMessage(null);
    setIsAnalyzingImage(true);
    try {
      // 즉시 미리보기 (로컬 object URL)
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const tempUrl = URL.createObjectURL(file);
      objectUrlRef.current = tempUrl;
      setPreview(tempUrl);
      setLabelPath(null);

      const processed = await processImage(file);
      // design_code처럼 base64(dataURL) 미리보기로 고정 (사라짐 방지)
      setPreview(processed);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      const base64Data = processed.split(",")[1] ?? "";
      const mimeType = processed.split(";")[0]?.split(":")[1] ?? "image/jpeg";

      // Storage 업로드
      const supabase = createClient();
      const fileName = crypto.randomUUID?.() ?? `${Date.now()}`;
      const path = `${houseId}/new/${fileName}.jpg`;
      const blob = base64ToBlob(base64Data, mimeType);
      const upload = await supabase.storage
        .from("wine-images")
        .upload(path, blob, {
          contentType: mimeType,
          upsert: true,
        });
      if (upload.error) throw upload.error;
      setLabelPath(path);

      const data = await postJson<ParsedWine>("/api/ai/analyze-label", {
        base64Data,
        mimeType,
      });
      applyParsed(data);
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : "라벨 분석에 실패했습니다."
      );
    } finally {
      setIsAnalyzingImage(false);
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          void handlePickImage(file);
        }}
      />

      {hasPreview ? (
        <div className="relative rounded-3xl overflow-hidden shadow-lg shadow-indigo-100 group">
          <NextImage
            src={preview ?? ""}
            alt="Wine Label"
            width={800}
            height={320}
            sizes="(max-width: 768px) 100vw, 448px"
            className="w-full h-48 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = "";
                fileInputRef.current?.click();
              }}
              disabled={isAnalyzingImage}
              className="bg-white/90 backdrop-blur text-stone-800 px-6 py-3 rounded-full font-extrabold text-sm flex items-center gap-2 hover:bg-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              {isAnalyzingImage ? "재분석 중..." : "다시 찍기"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (isAnalyzingImage) return;
            fileInputRef.current?.click();
          }}
          disabled={isAnalyzingImage || isParsing}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl py-4 shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all hover:brightness-110"
        >
          {isAnalyzingImage ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="font-bold">라벨 분석 중...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                <path
                  fillRule="evenodd"
                  d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-bold">사진 찍어 자동 입력</span>
            </>
          )}
        </button>
      )}

      {!hasPreview ? (
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-stone-200" />
          <span className="flex-shrink-0 mx-4 text-stone-300 text-xs font-bold uppercase">
            OR
          </span>
          <div className="flex-grow border-t border-stone-200" />
        </div>
      ) : null}

      <div className="relative">
        <textarea
          id={textareaId}
          name="raw_input"
          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-3xl text-stone-900 placeholder-stone-300 focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-100 text-lg font-medium shadow-sm transition-all"
          rows={2}
          placeholder="직접 입력 (예: 2018 티냐넬로)"
          defaultValue={initialText}
        />
        <input type="hidden" name="label_path" value={labelPath ?? ""} />
        <button
          type="button"
          className="absolute right-3 bottom-3 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-60"
          onClick={() => {
            if (isParsing) return;
            void handleAutoFillFromText();
          }}
          disabled={isParsing || isAnalyzingImage}
        >
          {isParsing ? "분석 중..." : "AI 분석"}
        </button>
      </div>

      {errorMessage ? (
        <div className="text-xs font-bold text-rose-600 px-1">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
