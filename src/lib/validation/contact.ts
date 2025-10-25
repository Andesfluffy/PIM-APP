export const CONTACT_EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export const MIN_PHONE_DIGITS = 7;
export const MAX_PHONE_DIGITS = 11;

export const CONTACT_PHONE_REGEX = new RegExp(
  `^\\d{${MIN_PHONE_DIGITS},${MAX_PHONE_DIGITS}}$`
);

const NON_DIGIT_REGEX = /\D+/g;

export function extractPhoneDigits(
  phone: string | null | undefined
): string {
  return (phone ?? "").replace(NON_DIGIT_REGEX, "");
}

export function clampPhoneDigits(phone: string | null | undefined): string {
  return extractPhoneDigits(phone).slice(0, MAX_PHONE_DIGITS);
}

export function isValidEmail(email: string): boolean {
  return CONTACT_EMAIL_REGEX.test(email.trim());
}

export function isValidPhone(phone: string | null | undefined): boolean {
  const digits = extractPhoneDigits(phone);
  if (!digits) return true;

  return (
    digits.length >= MIN_PHONE_DIGITS &&
    digits.length <= MAX_PHONE_DIGITS &&
    CONTACT_PHONE_REGEX.test(digits)
  );
}

export function sanitizeContactInput<T extends { name?: string; email?: string; phone?: string | null }>(
  input: T,
) {
  return {
    ...input,
    name: input.name?.trim() ?? "",
    email: input.email?.trim() ?? "",
    phone: extractPhoneDigits(input.phone),
  };
}
