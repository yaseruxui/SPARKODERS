/**
 * transitions.dev "error state shake": replays a short horizontal shake on every invalid field
 * in the form, then moves focus to the first one.
 */
export function shakeInvalidFields(form: HTMLFormElement): void {
  const fields = form.querySelectorAll<HTMLElement>('[aria-invalid="true"]');
  fields.forEach((field) => {
    field.classList.remove('animate-shake');
    // Force a reflow so the animation restarts when the same field fails twice in a row.
    void field.offsetWidth;
    field.classList.add('animate-shake');
    field.addEventListener('animationend', () => field.classList.remove('animate-shake'), { once: true });
  });
  fields[0]?.focus();
}
