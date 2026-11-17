import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { CMS_CACHE_TAG } from "@/lib/cms";

// Called by the Go backend over the internal Docker network after an admin save
// in the content, site images, projects, media or settings sections. The shared
// secret is compared here and never logged, so the endpoint stays useless to
// anyone who does not already hold it.
const TOKEN_HEADER = "x-revalidate-token";

// Hash both sides before comparing: the digests are always the same length, so
// the comparison is constant time and does not leak the secret's length.
function tokensMatch(provided: string, expected: string): boolean {
  if (provided === "" || expected === "") return false;
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const expected = process.env.REVALIDATE_TOKEN;
  if (!expected) {
    // Fail closed. Without a configured secret there is no way to authenticate
    // the caller, so do not expose an unauthenticated invalidation endpoint.
    return Response.json({ error: "revalidation is not configured" }, { status: 503 });
  }

  if (!tokensMatch(req.headers.get(TOKEN_HEADER) ?? "", expected)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // expire: 0 makes the next request re-render instead of serving stale content,
  // which is what "admin edits appear within seconds" needs. A route handler
  // cannot use updateTag (server actions only), so this is the supported form.
  revalidateTag(CMS_CACHE_TAG, { expire: 0 });

  // The prerendered page shell is a separate cache entry from the tagged data,
  // so expire it too; otherwise the old HTML is served until the ISR window ends.
  revalidatePath("/");

  return Response.json({ revalidated: true, tag: CMS_CACHE_TAG });
}