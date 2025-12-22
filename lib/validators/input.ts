export function sanitizeString(
  input: string,
  maxLength: number = 1000
): string {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }

  return input.trim().slice(0, maxLength).replace(/[<>]/g, "");
}

export function validateId(id: unknown): string {
  if (typeof id !== "string") {
    throw new Error("ID must be a string");
  }

  if (!/^[a-zA-Z0-9_-]{20,30}$/.test(id)) {
    throw new Error("Invalid ID format");
  }

  return id;
}

export function validatePrice(price: unknown): number {
  const priceNumber = parseFloat(String(price));

  if (isNaN(priceNumber)) {
    throw new Error("Price must be a number");
  }

  if (priceNumber < 0) {
    throw new Error("Price cannot be negative");
  }

  return Math.round(priceNumber * 100) / 100;
}

export function validateArray<T>(arr: unknown, maxLength: number = 100): T[] {
  if (!Array.isArray(arr)) {
    throw new Error("Input must be an array");
  }

  if (arr.length > maxLength) {
    throw new Error(`Array exceeds maximum length of ${maxLength}`);
  }

  return arr as T[];
}
