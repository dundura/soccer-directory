const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "";

export async function verifyCaptcha(token: string | undefined): Promise<boolean> {
  if (!SECRET_KEY) return true; // skip verification if not configured
  if (!token) return true; // allow if captcha widget didn't load (ad blockers, etc.)

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: SECRET_KEY, response: token }),
  });

  const data = await res.json();
  return data.success === true;
}
