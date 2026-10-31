/**
 * Copy Validation Utility — Lab 7
 * Validates AI marketing copy against sponsor brief constraints.
 */

const PROHIBITED_WORDS = ["best", "guarantee", "act now", "limited time only", "hurry"];

export function validateCopy(copyText, charLimit = 120) {
  const errors = [];

  // 1. Character length check
  if (!copyText || copyText.trim().length === 0) {
    errors.push("Copy text cannot be empty.");
  } else if (copyText.length > charLimit) {
    errors.push(`Copy exceeds maximum character limit of ${charLimit} (Current: ${copyText.length}).`);
  }

  // 2. Prohibited wording check (Urgency / Superlatives)
  const lowerCopy = copyText.toLowerCase();
  PROHIBITED_WORDS.forEach((word) => {
    if (lowerCopy.includes(word)) {
      errors.push(`Copy contains prohibited phrase: "${word}".`);
    }
  });

  return {
    isValid: errors.length === 0,
    charCount: copyText ? copyText.length : 0,
    errors,
  };
}