import { hasRevalidateSecret } from '@/lib/cms';
import { bundledContent } from '@/lib/content';

/** The site's bundled content, read once by the dashboard API to fill an empty dashboard. */
export async function GET(request: Request) {
  if (!hasRevalidateSecret(request.headers.get('x-revalidate-secret'))) {
    return Response.json({ ok: false }, { status: 401 });
  }
  return Response.json(await bundledContent());
}
