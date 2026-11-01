const TATWEEL = 'ـ';

/**
 * Renders a heading phrase that carries decorative kashida (ـ). Sighted visitors see the
 * stretched word; assistive tech gets the same text without the tatweel characters, so screen
 * readers do not announce them. Text without kashida renders unchanged.
 */
export function Kashida({ text }: { text: string }) {
  if (!text.includes(TATWEEL)) return text;
  return (
    <>
      <span aria-hidden="true">{text}</span>
      <span className="sr-only">{text.replaceAll(TATWEEL, '')}</span>
    </>
  );
}
