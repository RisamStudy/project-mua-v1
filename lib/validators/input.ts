export function sanitizeString(
  input: string,
  maxLength: number = 1000
): string {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }

  // More comprehensive XSS prevention
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>'"&]/g, (match) => {
      const htmlEntities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return htmlEntities[match] || match;
    })
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

export function validatePhoneNumber(phone: string): string {
  if (typeof phone !== "string") {
    throw new Error("Phone number must be a string");
  }
  
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10 || cleaned.length > 15) {
    throw new Error("Phone number must be between 10-15 digits");
  }
  
  return cleaned;
}

export function validateEmail(email: string): string {
  if (typeof email !== "string") {
    throw new Error("Email must be a string");
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }
  
  return email.toLowerCase().trim();
}

export function validateDate(dateString: string): Date {
  if (typeof dateString !== "string") {
    throw new Error("Date must be a string");
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }
  
  return date;
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
