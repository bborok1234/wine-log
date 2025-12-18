"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function login(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const redirectTo = getString(formData, "redirect");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const redirectParam = redirectTo
      ? `&redirect=${encodeURIComponent(redirectTo)}`
      : "";
    redirect(
      `/login?error=${encodeURIComponent(error.message)}${redirectParam}`
    );
  }
  redirect(redirectTo || "/app");
}

export async function signup(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const redirectTo = getString(formData, "redirect");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    const redirectParam = redirectTo
      ? `&redirect=${encodeURIComponent(redirectTo)}`
      : "";
    redirect(
      `/login?error=${encodeURIComponent(error.message)}${redirectParam}`
    );
  }

  // 이메일 확인 없이 바로 세션이 생성된 경우 (설정에 따라)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session && redirectTo) {
    redirect(redirectTo);
  }

  const redirectParam = redirectTo
    ? `&redirect=${encodeURIComponent(redirectTo)}`
    : "";
  redirect(`/login?notice=check-email${redirectParam}`);
}
