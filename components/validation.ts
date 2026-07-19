export function validateRequired(value: any, message = "This field is required"): string | null {
  if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
    return message;
  }
  return null;
}

export function validateEmail(value: string, message = "Invalid email address"): string | null {
  if (!value) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) ? null : message;
}

export function validatePassword(value: string, message = "Password must be at least 8 characters and contain a number"): string | null {
  if (!value) return null;
  const passwordRegex = /^(?=.*[0-9]).{8,}$/;
  return passwordRegex.test(value) ? null : message;
}

export function validateMinLength(value: string, min: number, message = `Must be at least ${min} characters`): string | null {
  if (!value) return null;
  return value.length >= min ? null : message;
}

export function validateDateOfBirth(dob: Date | null, minAge = 13, maxAge = 120): string | null {
  if (!dob) return "Please select your date of birth";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  if (age < minAge) return `You must be at least ${minAge} years old.`;
  if (age > maxAge) return "Please enter a valid date of birth.";
  return null;
}

export function validateMatch(value: string, other: string, message = "Fields do not match"): string | null {
  if (value !== other) return message;
  return null;
}