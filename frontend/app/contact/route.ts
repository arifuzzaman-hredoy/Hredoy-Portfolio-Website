import { NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.PORTFOLIO_BACKEND_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

// Relative redirect so the browser stays on the public origin even when the
// app runs behind a reverse proxy (nginx) on an internal port.
function redirectBack(result: "sent" | "error") {
  return new NextResponse(null, {
    status: 303,
    headers: { Location: `/?${result}=1#contact` },
  });
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return redirectBack("error");
  }

  // Honeypot: silently accept submissions that fill the hidden website field.
  const website = String(form.get("website") ?? "").trim();
  if (website !== "") {
    return redirectBack("sent");
  }

  const body = new URLSearchParams();
  for (const key of ["name", "email", "subject", "message"]) {
    body.set(key, String(form.get(key) ?? "").trim());
  }

  try {
    const res = await fetch(`${BACKEND_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    return redirectBack(res.ok ? "sent" : "error");
  } catch {
    return redirectBack("error");
  }
}