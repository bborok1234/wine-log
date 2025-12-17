import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
  backHref?: string;
  transparentHeader?: boolean;
  floatingActionButton?: ReactNode;
}

export function Layout({
  children,
  title,
  actions,
  backHref,
  transparentHeader = false,
  floatingActionButton,
}: LayoutProps) {
  return (
    <div className="h-[100dvh] w-full bg-[#F9F9F8] flex justify-center overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-wine-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/40 h-full shadow-2xl shadow-stone-200/50 flex flex-col relative backdrop-blur-[2px]">
        <div
          className={[
            "absolute top-0 left-0 right-0 z-30 px-5 py-3 flex items-center justify-between h-16 transition-all duration-300",
            transparentHeader ? "bg-transparent" : "glass-nav",
          ].join(" ")}
        >
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {backHref ? (
              <a
                href={backHref}
                className="p-2 -ml-2 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors text-stone-700"
                aria-label="뒤로"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </a>
            ) : null}

            {title ? (
              <h1
                className={[
                  "font-bold text-xl text-stone-800 tracking-tight truncate",
                  backHref ? "" : "ml-0.5",
                ].join(" ")}
              >
                {title}
              </h1>
            ) : null}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        </div>

        <main className="flex-1 overflow-y-auto no-scrollbar pt-16 pb-24 w-full">
          {children}
        </main>

        {floatingActionButton ? (
          <div className="absolute bottom-6 right-6 z-50 animate-scale-in origin-bottom-right">
            {floatingActionButton}
          </div>
        ) : null}
      </div>
    </div>
  );
}


