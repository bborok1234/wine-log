"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

import { Layout } from "@/components/layout";
import {
  Button,
  Card,
  Input,
  StarRating,
  TextArea,
  WineTypeBadge,
} from "@/components/ui";
import { SelectField } from "@/components/ui/select-field";
import { createClient } from "@/lib/supabase/client";

import { useSommelierAdvice, type SommelierAdvice } from "./ai-sommelier";
import { ConsumeWineModal } from "./consume-wine-modal";
import { HeroImageViewer } from "./hero-image-viewer";

interface PurchaseItem {
  id: string;
  purchasedAt: string | null;
  createdAt: string;
  store: string;
  unitPrice: number;
  quantity: number;
  dateLabel: string;
}

interface WineDetailData {
  id: string;
  producer: string;
  name: string | null;
  vintage: number | null;
  country: string | null;
  region: string | null;
  type: string | null;
  stockQty: number;
  avgPurchasePrice: number;
  rating: number | null;
  comment: string | null;
  tastingReview: string | null;
  sommelierAdvice?: SommelierAdvice | null;
}

function processImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const imageEl = new window.Image();
      imageEl.onload = () => {
        const canvas = document.createElement("canvas");
        let width = imageEl.width;
        let height = imageEl.height;
        const MAX = 800;
        if (width > height) {
          if (width > MAX) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          }
        } else if (height > MAX) {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(imageEl, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      imageEl.onerror = reject;
      imageEl.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function base64ToBlob(base64: string, mimeType: string) {
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: mimeType });
}

export function WineDetailShell({
  houseId,
  wine,
  heroUrl,
  purchases,
  flashError,
  openBottleAction,
  updateNotesAction,
  updateWineInfoAction,
  deleteWineAction,
  deletePurchaseAction,
}: {
  houseId: string;
  wine: WineDetailData;
  heroUrl: string | null;
  purchases: PurchaseItem[];
  flashError: string | null;
  openBottleAction: (formData: FormData) => void | Promise<void>;
  updateNotesAction: (formData: FormData) => void | Promise<void>;
  updateWineInfoAction: (formData: FormData) => void | Promise<void>;
  deleteWineAction: (formData: FormData) => void | Promise<void>;
  deletePurchaseAction: (formData: FormData) => void | Promise<void>;
}) {
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [showDeleteWineConfirm, setShowDeleteWineConfirm] = useState(false);
  const [deletingPurchaseId, setDeletingPurchaseId] = useState<string | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [labelPath, setLabelPath] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [infoForm, setInfoForm] = useState(() => ({
    producer: wine.producer,
    name: wine.name ?? "",
    vintage: wine.vintage ? String(wine.vintage) : "",
    country: wine.country ?? "",
    region: wine.region ?? "",
    type: (wine.type ?? "red").toLowerCase(),
  }));

  const [reviewForm, setReviewForm] = useState(() => ({
    rating: Math.max(0, Math.min(5, Number(wine.rating ?? 0))),
    comment: wine.comment ?? "",
    tastingReview: wine.tastingReview ?? "",
  }));
  const reviewFormRef = useRef<HTMLFormElement | null>(null);
  const infoFormRef = useRef<HTMLFormElement | null>(null);
  async function handleSubmitReview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await updateNotesAction(formData);
    setIsEditingReview(false);
  }

  async function handleSubmitInfo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await updateWineInfoAction(formData);
    setIsEditingInfo(false);
  }

  const {
    isOpen: isAdviceOpen,
    isLoading: isLoadingAdvice,
    advice: sommelierAdvice,
    errorMessage: sommelierError,
    handleAsk: handleAskSommelier,
    handleRefresh: handleRefreshSommelier,
  } = useSommelierAdvice(houseId, wine.id, wine.sommelierAdvice ?? null);

  const hasReview = useMemo(() => {
    return (wine.rating ?? 0) > 0 || !!wine.comment || !!wine.tastingReview;
  }, [wine.rating, wine.comment, wine.tastingReview]);

  const transparentHeader = !!heroUrl && !isEditingInfo;

  async function handlePickNewImage(file: File) {
    setIsUploadingImage(true);
    try {
      const dataUrl = await processImage(file);
      setImagePreview(dataUrl);

      const base64Data = dataUrl.split(",")[1] ?? "";
      const mimeType = dataUrl.split(";")[0]?.split(":")[1] ?? "image/jpeg";
      const blob = base64ToBlob(base64Data, mimeType);

      const supabase = createClient();
      const fileName = crypto.randomUUID?.() ?? `${Date.now()}`;
      const path = `${houseId}/wine/${wine.id}/${fileName}.jpg`;
      const upload = await supabase.storage
        .from("wine-images")
        .upload(path, blob, {
          contentType: mimeType,
          upsert: true,
        });
      if (upload.error) throw upload.error;
      setLabelPath(path);
    } finally {
      setIsUploadingImage(false);
    }
  }

  return (
    <Layout
      backHref={`/h/${houseId}/cellar`}
      transparentHeader={transparentHeader}
      actions={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditingInfo((v) => !v)}
            className={[
              "p-2.5 rounded-full backdrop-blur-md transition-colors",
              isEditingInfo
                ? "text-wine-600 bg-wine-50"
                : "text-stone-600 bg-white/40 hover:bg-white/80",
            ].join(" ")}
            title="정보 수정"
            aria-label="정보 수정"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM16.862 4.487L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </button>
          <a
            href={`/h/${houseId}/purchase/new?wineId=${wine.id}`}
            className="text-stone-600 bg-white/40 hover:bg-white/80 backdrop-blur-md transition-colors p-2.5 rounded-full"
            title="추가 구매"
            aria-label="추가 구매"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </a>
          <button
            type="button"
            onClick={() => setShowDeleteWineConfirm(true)}
            className="text-red-600 bg-white/40 hover:bg-white/80 backdrop-blur-md transition-colors p-2.5 rounded-full"
            title="와인 삭제"
            aria-label="와인 삭제"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        </div>
      }
    >
      {!isEditingInfo && heroUrl ? (
        <HeroImageViewer src={heroUrl} alt={wine.name ?? wine.producer} />
      ) : null}

      <div
        className={[
          "px-6 pb-24",
          heroUrl && !isEditingInfo ? "-mt-16 relative z-10" : "pt-6",
        ].join(" ")}
      >
        {flashError ? (
          <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 mb-4">
            {flashError}
          </div>
        ) : null}

        {isEditingInfo ? (
          <div className="w-full bg-white p-6 rounded-[32px] border border-wine-100 shadow-xl text-left space-y-4 mb-10 animate-scale-in mt-4">
            <h3 className="text-xs font-bold text-wine-500 uppercase mb-2 tracking-widest">
              와인 정보 수정
            </h3>

            <div className="flex items-center gap-4 mb-2">
              {imagePreview || heroUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview ?? heroUrl ?? ""}
                  alt="preview"
                  className="w-20 h-20 rounded-2xl object-cover border border-stone-200 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center text-3xl">
                  🍷
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  void handlePickNewImage(f);
                }}
              />

              <Button
                variant="secondary"
                type="button"
                className="!py-2.5 !px-4 !text-xs"
                loading={isUploadingImage}
                onClick={() => fileInputRef.current?.click()}
              >
                사진 변경
              </Button>
            </div>

            <form ref={infoFormRef} onSubmit={handleSubmitInfo}>
              <input type="hidden" name="houseId" value={houseId} />
              <input type="hidden" name="wineId" value={wine.id} />
              <input type="hidden" name="label_path" value={labelPath} />

              <Input
                label="생산자"
                name="producer"
                value={infoForm.producer}
                onChange={(e) =>
                  setInfoForm((p) => ({ ...p, producer: e.target.value }))
                }
              />
              <Input
                label="이름"
                name="name"
                value={infoForm.name}
                onChange={(e) =>
                  setInfoForm((p) => ({ ...p, name: e.target.value }))
                }
              />
              <div className="flex gap-3">
                <Input
                  label="빈티지"
                  className="!w-full"
                  name="vintage"
                  inputMode="numeric"
                  value={infoForm.vintage}
                  onChange={(e) =>
                    setInfoForm((p) => ({ ...p, vintage: e.target.value }))
                  }
                />
                <div className="flex-1">
                  <SelectField
                    label="종류"
                    name="type"
                    value={infoForm.type}
                    onValueChange={(next) =>
                      setInfoForm((p) => ({ ...p, type: next }))
                    }
                    options={[
                      { label: "레드", value: "red" },
                      { label: "화이트", value: "white" },
                      { label: "스파클링", value: "sparkling" },
                      { label: "로제", value: "rose" },
                      { label: "디저트", value: "dessert" },
                      { label: "주정강화", value: "fortified" },
                      { label: "기타", value: "other" },
                    ]}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Input
                  label="지역"
                  name="region"
                  value={infoForm.region}
                  onChange={(e) =>
                    setInfoForm((p) => ({ ...p, region: e.target.value }))
                  }
                />
                <Input
                  label="국가"
                  name="country"
                  value={infoForm.country}
                  onChange={(e) =>
                    setInfoForm((p) => ({ ...p, country: e.target.value }))
                  }
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  variant="secondary"
                  fullWidth
                  type="button"
                  onClick={() => setIsEditingInfo(false)}
                >
                  취소
                </Button>
                <Button fullWidth type="submit">
                  저장
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-10 transition-all animate-fade-in-up">
              <div className="mb-4">
                <WineTypeBadge type={wine.type} />
              </div>

              <h2 className="text-4xl font-bold text-stone-900 leading-tight tracking-tight font-serif mb-2">
                {wine.producer}
              </h2>
              {wine.name ? (
                <h3 className="text-xl text-stone-600 font-medium">
                  {wine.name}
                </h3>
              ) : null}

              <div className="flex items-center gap-2 mt-3 text-stone-500 text-sm font-medium tracking-wide">
                <span className="bg-stone-100 px-2 py-0.5 rounded-md text-stone-600">
                  {wine.vintage ?? "NV"}
                </span>
                {wine.region ? <span>{wine.region}</span> : null}
                {wine.country ? (
                  <span className="text-stone-400">| {wine.country}</span>
                ) : null}
              </div>

              <div className="mt-10 w-full">
                <div className="relative flex items-center justify-center group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-wine-100/50 to-pink-100/50 rounded-full blur-3xl group-hover:blur-[60px] transition-all" />
                  <div
                    className={[
                      "w-36 h-36 relative rounded-full flex flex-col items-center justify-center shadow-2xl z-10",
                      wine.stockQty > 0
                        ? "bg-white/80 backdrop-blur-md border border-white"
                        : "bg-stone-50 border border-stone-100",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "text-6xl font-bold",
                        wine.stockQty > 0 ? "text-stone-800" : "text-stone-300",
                      ].join(" ")}
                    >
                      {wine.stockQty}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-2">
                      BOTTLES LEFT
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 w-full max-w-sm mx-auto mt-8">
                  <ConsumeWineModal
                    houseId={houseId}
                    wineId={wine.id}
                    producer={wine.producer}
                    name={wine.name}
                    disabled={wine.stockQty === 0}
                    formAction={openBottleAction}
                    triggerClassName={[
                      "!py-3 shadow-xl w-full text-base",
                      wine.stockQty === 0 ? "opacity-50" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    triggerContent={
                      wine.stockQty > 0 ? "한 병 마시기 🥂" : "재고 없음"
                    }
                  />

                  {!sommelierAdvice ? (
                    <button
                      type="button"
                      onClick={() => void handleAskSommelier()}
                      className={[
                        "flex items-center justify-center w-14 h-14 rounded-full border shadow-lg active:scale-95 transition-all flex-shrink-0",
                        "bg-white text-stone-400 border-stone-100 hover:text-indigo-500",
                      ].join(" ")}
                      aria-label="AI 소믈리에"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  ) : null}
                </div>

                {sommelierAdvice || isAdviceOpen ? (
                  <div className="mt-8 overflow-hidden relative rounded-[32px] animate-fade-in-up shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#EEF2FF] via-[#F5F3FF] to-[#FFF1F2]" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl" />

                    <div className="relative p-6 border border-white/50">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                          <span className="text-xl">✨</span> AI 소믈리에
                          {isLoadingAdvice ? (
                            <span className="text-xs font-normal text-indigo-400 animate-pulse ml-2">
                              분석 중...
                            </span>
                          ) : null}
                        </h4>
                        <button
                          type="button"
                          onClick={() => void handleRefreshSommelier()}
                          className="p-2 bg-white/60 rounded-full text-stone-500 hover:bg-white transition-colors disabled:opacity-60"
                          aria-label="새로 분석"
                          disabled={isLoadingAdvice}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 7.172a4 4 0 015.656-5.656l.586.586a1 1 0 01-1.414 1.414l-.586-.586A2 2 0 104.586 8.586l1.12 1.12a1 1 0 01-1.414 1.414l-1.12-1.12a4 4 0 010-5.656zm13.656 5.656a4 4 0 01-5.656 5.656l-.586-.586a1 1 0 111.414-1.414l.586.586A2 2 0 1015.414 11.4l-1.12-1.12a1 1 0 111.414-1.414l1.12 1.12a4 4 0 010 5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>

                      {isLoadingAdvice ? (
                        <div className="space-y-3 opacity-60">
                          <div className="h-4 bg-indigo-200/50 rounded w-full animate-pulse" />
                          <div className="h-4 bg-indigo-200/50 rounded w-2/3 animate-pulse" />
                        </div>
                      ) : sommelierError ? (
                        <p className="text-sm text-rose-600 font-bold">
                          {sommelierError}
                        </p>
                      ) : sommelierAdvice ? (
                        <div className="text-sm text-indigo-900/80 space-y-5">
                          <p className="italic font-medium text-lg leading-relaxed text-indigo-950">
                            &quot;{sommelierAdvice.description}&quot;
                          </p>

                          <div className="bg-white/60 p-4 rounded-2xl shadow-sm border border-white/40">
                            <span className="font-bold text-indigo-900 block text-[10px] uppercase tracking-wide mb-1 opacity-60">
                              🍇 주요 품종
                            </span>
                            {sommelierAdvice.grapeVariety ?? "정보 없음"}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/60 p-4 rounded-2xl shadow-sm border border-white/40">
                              <span className="font-bold text-indigo-900 block text-[10px] uppercase tracking-wide mb-1 opacity-60">
                                🍽 추천 음식
                              </span>
                              {sommelierAdvice.pairing}
                            </div>
                            <div className="bg-white/60 p-4 rounded-2xl shadow-sm border border-white/40">
                              <span className="font-bold text-indigo-900 block text-[10px] uppercase tracking-wide mb-1 opacity-60">
                                🌡 서빙 온도
                              </span>
                              {sommelierAdvice.servingTemp}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-stone-500">
                          정보를 가져오지 못했어요. 잠시 후 다시 시도해주세요.
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mb-8 delay-100 animate-fade-in-up">
              {isEditingReview ? (
                <div className="bg-white p-6 rounded-[32px] border border-stone-200 shadow-xl">
                  <h4 className="font-bold text-stone-800 mb-6 text-lg">
                    테이스팅 노트 작성
                  </h4>

                  <form ref={reviewFormRef} onSubmit={handleSubmitReview}>
                    <input type="hidden" name="houseId" value={houseId} />
                    <input type="hidden" name="wineId" value={wine.id} />
                    <input
                      type="hidden"
                      name="rating"
                      value={String(reviewForm.rating)}
                    />

                    <div className="mb-6 flex flex-col items-center p-4 bg-stone-50 rounded-2xl">
                      <label className="text-xs font-bold text-stone-400 uppercase mb-3 tracking-widest">
                        Score
                      </label>
                      <StarRating
                        rating={reviewForm.rating}
                        size="lg"
                        onChange={(r) =>
                          setReviewForm((p) => ({ ...p, rating: r }))
                        }
                      />
                    </div>

                    <Input
                      label="한줄 평"
                      placeholder="와인의 첫인상은 어땠나요?"
                      name="comment"
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm((p) => ({
                          ...p,
                          comment: e.target.value,
                        }))
                      }
                    />
                    <TextArea
                      label="상세 테이스팅 노트"
                      placeholder="향, 맛, 바디감, 피니쉬 등을 자유롭게 기록해보세요."
                      name="tasting_review"
                      value={reviewForm.tastingReview}
                      onChange={(e) =>
                        setReviewForm((p) => ({
                          ...p,
                          tastingReview: e.target.value,
                        }))
                      }
                    />

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="secondary"
                        fullWidth
                        type="button"
                        onClick={() => setIsEditingReview(false)}
                      >
                        취소
                      </Button>
                      <Button fullWidth type="submit">
                        저장하기
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="glass-card bg-white/60 p-6 rounded-[32px] relative group border border-white">
                  <button
                    type="button"
                    onClick={() => setIsEditingReview(true)}
                    className="absolute top-5 right-5 text-stone-300 hover:text-stone-600 transition-colors p-1"
                    aria-label="테이스팅 노트 수정"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                    </svg>
                  </button>

                  <h4 className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    Tasting Notes
                  </h4>

                  {hasReview ? (
                    <div className="space-y-5">
                      <div className="flex items-center gap-4">
                        <StarRating
                          rating={Number(wine.rating ?? 0)}
                          readOnly
                        />
                        <span className="font-bold text-2xl text-stone-800">
                          {wine.rating ? Number(wine.rating).toFixed(1) : ""}
                        </span>
                      </div>
                      {wine.comment ? (
                        <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-100">
                          <p className="font-medium text-stone-700 italic">
                            &quot;{wine.comment}&quot;
                          </p>
                        </div>
                      ) : null}
                      {wine.tastingReview ? (
                        <p className="text-stone-600 text-sm leading-7 whitespace-pre-wrap font-sans">
                          {wine.tastingReview}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-stone-400 mb-4 text-sm font-medium">
                        아직 기록된 테이스팅 노트가 없어요.
                      </p>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => setIsEditingReview(true)}
                        className="!py-2.5 !px-5 !text-xs"
                      >
                        첫 리뷰 남기기 ✍️
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="delay-300 animate-fade-in-up">
              <h4 className="text-lg font-bold text-stone-800 mb-5 px-1">
                구매 기록
              </h4>
              <div className="space-y-4 relative pb-10">
                <div className="absolute left-[18px] top-3 bottom-5 w-0.5 bg-stone-200 rounded-full" />
                {purchases.map((p) => (
                  <div key={p.id} className="relative pl-12 group">
                    <div className="absolute left-[12px] top-5 w-3.5 h-3.5 bg-white rounded-full border-[3px] border-stone-300 group-hover:border-wine-400 transition-colors z-10" />
                    <Card className="p-4 !rounded-2xl hover:translate-x-1 transition-transform">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-stone-800">
                          {p.dateLabel}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-xs">
                            + {p.quantity}병
                          </span>
                          <form
                            action={deletePurchaseAction}
                            onSubmit={(e) => {
                              if (
                                !confirm(
                                  "구매 기록을 삭제하시겠어요? 재고도 함께 차감됩니다."
                                )
                              ) {
                                e.preventDefault();
                              } else {
                                setDeletingPurchaseId(p.id);
                              }
                            }}
                          >
                            <input
                              type="hidden"
                              name="houseId"
                              value={houseId}
                            />
                            <input
                              type="hidden"
                              name="purchaseId"
                              value={p.id}
                            />
                            <button
                              type="submit"
                              disabled={deletingPurchaseId === p.id}
                              className="p-1.5 text-stone-400 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="구매 기록 삭제"
                              aria-label="구매 기록 삭제"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            </button>
                          </form>
                        </div>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <span className="text-sm text-stone-500 font-medium flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-3 h-3 text-stone-300"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.136 5.097l.08.06a.75.75 0 01-.167 1.21c-.42.169-.702.57-.761 1.035l-.115.866a15.22 15.22 0 01-.264 1.57C16.632 15.508 13.922 18.5 10 18.5c-3.922 0-6.632-2.992-7.246-7.344-.121-.863-.195-1.558-.264-1.57l-.115-.866a1.25 1.25 0 00-.76-1.035.75.75 0 01-.168-1.21l.08-.06a41.059 41.059 0 018.137-5.097zM10 3.167a.75.75 0 01.75.75v3.186l2.353 1.176a.75.75 0 11-.67 1.342L10 8.384 7.567 9.621a.75.75 0 11-.67-1.342L9.25 7.103V3.917A.75.75 0 0110 3.167z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {p.store}
                        </span>
                        <span className="text-sm font-bold text-stone-400">
                          {Math.round(p.unitPrice).toLocaleString()}원
                        </span>
                      </div>
                    </Card>
                  </div>
                ))}
                {purchases.length === 0 ? (
                  <p className="text-stone-400 text-sm italic pl-12 py-4">
                    구매 기록이 없어요.
                  </p>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>

      {showDeleteWineConfirm ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-5 bg-stone-900/30 backdrop-blur-md animate-fade-in"
          onClick={() => setShowDeleteWineConfirm(false)}
        >
          <div
            className="bg-white rounded-[32px] p-6 w-full max-w-xs shadow-2xl animate-scale-in border border-white/60"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ⚠️
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">
                와인을 삭제하시겠어요?
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                <span className="font-bold text-stone-800 text-base">
                  {wine.producer}
                </span>
                <br />
                <span className="text-stone-500">{wine.name}</span>
                <br />
                <br />
                이 작업은 되돌릴 수 없어요.
                <br />
                <span className="text-xs text-stone-400">
                  (모든 구매 기록과 정보가 삭제됩니다)
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 w-full"
                onClick={() => setShowDeleteWineConfirm(false)}
              >
                취소
              </button>

              <form action={deleteWineAction} className="w-full">
                <input type="hidden" name="houseId" value={houseId} />
                <input type="hidden" name="wineId" value={wine.id} />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-bold bg-red-600 text-white shadow-lg shadow-red-200 hover:shadow-red-300 hover:brightness-105 w-full"
                >
                  삭제
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
