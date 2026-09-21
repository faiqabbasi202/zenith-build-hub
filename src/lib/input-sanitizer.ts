import type { TableConfig } from "@/components/admin/admin-tables-config";

/**
 * Sanitize text input by removing dangerous tags, script injections, and excessive whitespace.
 */
export function sanitizeText(input: string | null | undefined): string {
  if (input == null) return "";
  let clean = String(input);

  // Strip script, style, iframe, object, embed tags and content
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  clean = clean.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  clean = clean.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "");

  // Strip dangerous inline event handlers (e.g. onclick=, onerror=)
  clean = clean.replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "");
  clean = clean.replace(/\son\w+\s*=\s*[^>\s]+/gi, "");

  // Strip javascript: pseudo-protocols
  clean = clean.replace(/javascript\s*:/gi, "");

  return clean.trim();
}

/**
 * Sanitize and normalize slugs into standard lowercase kebab-case.
 */
export function sanitizeSlug(input: string | null | undefined): string {
  if (!input) return "";
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove special characters
    .replace(/[\s_-]+/g, "-")  // replace spaces and underscores with single hyphen
    .replace(/^-+|-+$/g, "");  // trim leading/trailing hyphens
}

/**
 * Validates and sanitizes a URL or path.
 * Must start with http://, https://, or / (root-relative).
 */
export function sanitizeUrl(input: string | null | undefined): string {
  if (!input) return "";
  const trimmed = String(input).trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed.replace(/[<>"'()]/g, ""); // strip characters that could break attributes
  }
  // If user entered a relative path without leading slash, add it
  if (trimmed.startsWith("images/") || trimmed.startsWith("amarc/")) {
    return `/${trimmed.replace(/[<>"'()]/g, "")}`;
  }
  return trimmed.replace(/[<>"'()]/g, "");
}

/**
 * Strict record validator for admin forms
 */
export function validateRecord(
  formData: Record<string, any>,
  config: TableConfig,
): Record<string, string> {
  const errors: Record<string, string> = {};

  config.fields.forEach((field) => {
    const val = formData[field.key];

    // 1. Required field check
    if (field.required) {
      if (val == null || String(val).trim() === "") {
        errors[field.key] = `${field.label} is required.`;
        return;
      }
    }

    // Skip validation for empty optional fields
    if (val == null || String(val).trim() === "") {
      return;
    }

    // 2. Slug check
    if (field.key === "slug" || field.key.endsWith("_slug")) {
      const slugStr = String(val).trim();
      const validSlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!validSlugRegex.test(slugStr)) {
        errors[field.key] = `${field.label} must be lowercase letters, numbers, and hyphens only (e.g. "arfa-tower-b").`;
      }
    }

    // 3. Email check
    if (field.key === "email" || field.key.includes("email")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(val).trim())) {
        errors[field.key] = "Please enter a valid email address.";
      }
    }

    // 4. Number bounds check
    if (field.type === "number") {
      const num = Number(val);
      if (isNaN(num)) {
        errors[field.key] = `${field.label} must be a valid number.`;
      } else if (field.key === "progress_percent" && (num < 0 || num > 100)) {
        errors[field.key] = "Progress must be between 0 and 100%.";
      } else if (field.key === "sort_order" && num < 0) {
        errors[field.key] = "Sort order must be 0 or greater.";
      } else if (field.key === "value_pkr_millions" && num < 0) {
        errors[field.key] = "Contract value cannot be negative.";
      }
    }

    // 5. URL format check
    if (field.key.includes("url") || field.key.includes("href") || field.key.includes("website")) {
      const urlStr = String(val).trim();
      if (
        !urlStr.startsWith("http://") &&
        !urlStr.startsWith("https://") &&
        !urlStr.startsWith("/") &&
        !urlStr.startsWith("data:image/")
      ) {
        errors[field.key] = `${field.label} must start with https://, http://, or a relative path starting with /`;
      }
    }
  });

  return errors;
}

/**
 * Sanitize an entire form data payload according to table configuration
 */
export function sanitizeFormData(
  formData: Record<string, any>,
  config: TableConfig,
): Record<string, any> {
  const sanitized: Record<string, any> = { ...formData };

  config.fields.forEach((field) => {
    const val = sanitized[field.key];
    if (val == null) return;

    if (field.type === "text" || field.type === "textarea") {
      if (field.key === "slug" || field.key.endsWith("_slug")) {
        sanitized[field.key] = sanitizeSlug(val);
      } else if (field.key.includes("url") || field.key.includes("href") || field.key.includes("website")) {
        sanitized[field.key] = sanitizeUrl(val);
      } else {
        sanitized[field.key] = sanitizeText(val);
      }
    } else if (field.type === "image") {
      sanitized[field.key] = sanitizeUrl(val);
    } else if (field.type === "number") {
      sanitized[field.key] = val === "" || val == null ? null : Number(val);
    }
  });

  return sanitized;
}
