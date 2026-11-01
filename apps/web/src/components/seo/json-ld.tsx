import type { JsonLd } from '@/types/seo';

/** Structured data block. `<` is escaped so content can never close the script element. */
export function JsonLdScript({ data }: { data: JsonLd | readonly JsonLd[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
