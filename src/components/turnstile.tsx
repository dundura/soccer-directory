"use client";

import { Turnstile as TurnstileWidget } from "@marsidev/react-turnstile";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export function Turnstile({ onSuccess, onError }: { onSuccess: (token: string) => void; onError?: () => void }) {
  if (!siteKey) {
    // No captcha configured — allow submission
    if (typeof window !== "undefined") setTimeout(() => onSuccess("bypass"), 0);
    return null;
  }
  return (
    <TurnstileWidget
      siteKey={siteKey}
      onSuccess={onSuccess}
      onError={() => onError?.()}
      onExpire={() => onError?.()}
      options={{ size: "flexible", theme: "light" }}
    />
  );
}
