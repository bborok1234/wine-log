"use client";

import Image from "next/image";
import { useState } from "react";

export function HeroImageViewer({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="relative w-full h-80 bg-stone-200 block"
        onClick={() => setIsOpen(true)}
        aria-label="이미지 전체보기"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 448px"
          className="object-cover object-bottom"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F9F9F8] via-transparent to-black/10" />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-md aspect-[3/4] bg-black/30 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-contain"
              priority={false}
            />

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-stone-700 flex items-center justify-center shadow-md"
              aria-label="닫기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}


