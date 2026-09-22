/** Deja el RUT como "12345678-9": sin puntos, sin espacios y con el dígito verificador en mayúscula. */
export function normalizeRut(value: string) {
  const clean = value.replace(/[.\s-]/g, "").toUpperCase();
  if (clean.length < 2) return clean;
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
}

/** Valida el dígito verificador con el módulo 11 usado en Chile. */
export function isValidRut(value: string) {
  const normalized = normalizeRut(value);
  const match = /^(\d{7,8})-([\dK])$/.exec(normalized);
  if (!match) return false;

  const [, digits, checkDigit] = match;
  let sum = 0;
  let factor = 2;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    sum += Number(digits[index]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }

  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);
  return expected === checkDigit;
}
