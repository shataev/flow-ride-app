/** Max stored length for event description (must match Mongoose schema). */
export const EVENT_DESCRIPTION_MAX_LENGTH = 255;

/**
 * Normalizes optional user-supplied description: string only, strips dangerous
 * control chars, trims, caps length. Rejects non-strings (NoSQL / type confusion).
 */
export function normalizeEventDescription(
  input: unknown
): string | undefined {
  if (input === undefined || input === null) return undefined;
  if (typeof input !== "string") return undefined;
  let s = input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  s = s.trim();
  if (s.length === 0) return undefined;
  if (s.length > EVENT_DESCRIPTION_MAX_LENGTH) {
    s = s.slice(0, EVENT_DESCRIPTION_MAX_LENGTH);
  }
  return s;
}
