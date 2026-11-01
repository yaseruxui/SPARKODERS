/** Hidden from people and assistive tech; bots that fill it are rejected server-side. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -start-[9999px] size-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
