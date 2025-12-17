import type { Database } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

const WINE_IMAGES_BUCKET = "wine-images";
const STORAGE_PREFIX = "storage:wine-images/";

export function toStoredWineImagePath(path: string) {
  return `${STORAGE_PREFIX}${path}`;
}

export function getWineImagePathFromStored(value: string) {
  if (!value.startsWith(STORAGE_PREFIX)) return null;
  return value.slice(STORAGE_PREFIX.length);
}

export async function resolveWineImageUrl(
  supabase: SupabaseClient<Database>,
  value: string | null,
  {
    expiresIn = 60 * 60,
  }: {
    expiresIn?: number;
  } = {}
) {
  if (!value) return null;
  const path = getWineImagePathFromStored(value);
  if (!path) return value;

  const { data, error } = await supabase.storage
    .from(WINE_IMAGES_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) return null;

  return data.signedUrl;
}


