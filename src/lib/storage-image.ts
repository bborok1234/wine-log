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

function chunkArray<T>(items: T[], size: number) {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    chunks.push(items.slice(i, i + size));
  return chunks;
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

export async function resolveWineImageUrls(
  supabase: SupabaseClient<Database>,
  values: Array<string | null>,
  {
    expiresIn = 60 * 60,
    chunkSize = 100,
  }: {
    expiresIn?: number;
    chunkSize?: number;
  } = {}
) {
  if (values.length === 0) return [];

  const results: Array<string | null> = Array(values.length).fill(null);

  const toSign: Array<{ index: number; path: string }> = [];
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (!v) {
      results[i] = null;
      continue;
    }
    const path = getWineImagePathFromStored(v);
    if (!path) {
      results[i] = v;
      continue;
    }
    toSign.push({ index: i, path });
  }

  for (const chunk of chunkArray(toSign, chunkSize)) {
    const paths = chunk.map((c) => c.path);
    const { data, error } = await supabase.storage
      .from(WINE_IMAGES_BUCKET)
      .createSignedUrls(paths, expiresIn);
    if (error || !data) {
      chunk.forEach(({ index }) => {
        results[index] = null;
      });
      continue;
    }

    for (let i = 0; i < chunk.length; i++) {
      const idx = chunk[i].index;
      const signed = data[i]?.signedUrl ?? null;
      results[idx] = signed;
    }
  }

  return results;
}
