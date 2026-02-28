/**
 * Validates password strength.
 * Requires: min 8 chars, 1 uppercase, 1 lowercase, 1 number.
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must include at least 1 uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must include at least 1 lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must include at least 1 number.' };
  }
  return { valid: true, message: '' };
}

/**
 * Basic email format validation.
 */
export function validateEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Sanitizes text input: trims, enforces max length, strips control characters.
 */
export function sanitizeText(text: string, maxLength = 200): string {
  if (!text) return '';
  // Strip control characters (keep newlines and tabs for multiline fields)
  const cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return cleaned.trim().slice(0, maxLength);
}
