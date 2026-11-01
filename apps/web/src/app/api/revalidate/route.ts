import { revalidatePath, revalidateTag } from 'next/cache';
import { CMS_TAG, hasRevalidateSecret } from '@/lib/cms';

/** Called by the dashboard API after every save: the next visit to any page shows the change. */
export async function POST(request: Request) {
  if (!hasRevalidateSecret(request.headers.get('x-revalidate-secret'))) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag(CMS_TAG, { expire: 0 });
  // Pages are prerendered; drop them too so they rebuild with the new content.
  revalidatePath('/[locale]', 'layout');
  return Response.json({ ok: true });
}
