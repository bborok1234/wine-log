import type { Json } from "@/lib/database.types";

export interface SommelierAdvice {
  [key: string]: Json | undefined;
  description: string;
  pairing: string;
  servingTemp: string;
  grapeVariety: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isSommelierAdvice(value: unknown): value is SommelierAdvice {
  if (!isRecord(value)) return false;

  const description = value["description"];
  const pairing = value["pairing"];
  const servingTemp = value["servingTemp"];
  const grapeVariety = value["grapeVariety"];

  if (typeof description !== "string") return false;
  if (typeof pairing !== "string") return false;
  if (typeof servingTemp !== "string") return false;

  return grapeVariety === null || typeof grapeVariety === "string";
}

export function parseSommelierAdvice(value: unknown): SommelierAdvice | null {
  if (!isSommelierAdvice(value)) return null;
  return value;
}
