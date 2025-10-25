export const CONTACT_EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

// Accept common international formats while disallowing alphabetic characters.
// Requires at least 7 digits (ignoring spacing characters) and allows
// spaces, parentheses, periods, and dashes for readability.
export const CONTACT_PHONE_REGEX = /^(?=(?:.*\d){7,})\+?[0-9()\s.-]{7,20}$/;

export function isValidEmail(email: string): boolean {
  return CONTACT_EMAIL_REGEX.test(email.trim());
}

export function isValidPhone(phone: string | null | undefined): boolean {
  const trimmed = (phone ?? "").trim();
  if (!trimmed) return true;

  // Ensure at least 7 digits when non-empty.
  const digitCount = (trimmed.match(/\d/g) || []).length;
  if (digitCount < 7) return false;

  return CONTACT_PHONE_REGEX.test(trimmed);
}

export function sanitizeContactInput<T extends { name?: string; email?: string; phone?: string | null }>(
  input: T,
) {
  return {
    ...input,
    name: input.name?.trim() ?? "",
    email: input.email?.trim() ?? "",
    phone: input.phone?.trim() ?? "",
  };
}
