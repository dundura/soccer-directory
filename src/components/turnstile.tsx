"use client";

import { Turnstile as TurnstileWidget } from "@marsidev/react-turnstile";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export function Turnstile({ onSuccess }: { onSuccess: (token: string) => void }) {
  if (!siteKey) return null;
  return (
    <TurnstileWidget
      siteKey={siteKey}
      onSuccess={onSuccess}
      options={{ size: "flexible", theme: "light" }}
    />
  );
}
