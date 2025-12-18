"use client";

import NextTopLoader from "nextjs-toploader";

export function RouteTopLoader() {
  return (
    <NextTopLoader
      color="#9f1239"
      height={3}
      showSpinner={false}
      crawlSpeed={200}
      initialPosition={0.08}
      easing="ease"
      speed={200}
      shadow="0 0 8px rgba(159,18,57,0.35)"
    />
  );
}
