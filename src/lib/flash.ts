import { cookies } from "next/headers";

interface FlashPayload {
  kind: "error" | "success" | "info";
  message: string;
}

const FLASH_COOKIE_NAME = "wine_log_flash";

export async function setFlash(payload: FlashPayload) {
  const cookieStore = await cookies();
  cookieStore.set(
    FLASH_COOKIE_NAME,
    encodeURIComponent(JSON.stringify(payload)),
    {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 10, // 짧게 유지(일회성 메시지)
    }
  );
}

export async function getFlash() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(FLASH_COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as FlashPayload;
    if (!parsed?.kind || !parsed?.message) return null;
    // 1회성 처리(가능한 경우에만 삭제)
    // Next.js Server Component에서는 쿠키 변경이 막힐 수 있어 try/catch로 보호한다.
    try {
      cookieStore.delete(FLASH_COOKIE_NAME);
    } catch {}
    return parsed;
  } catch {
    try {
      cookieStore.delete(FLASH_COOKIE_NAME);
    } catch {}
    return null;
  }
}
