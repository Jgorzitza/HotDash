/**
 * Request validation middleware
 * 
 * Provides schema-based validation for request bodies and parameters
 * to ensure data integrity and security.
 */

type ValidationSchema = Record<string, {
  type: "string" | "number" | "boolean" | "email" | "url";
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
}>;

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate request body against schema
 * 
 * @param body - Request body to validate
 * @param schema - Validation schema
 * @returns Array of validation errors (empty if valid)
 */
export function validateBody(
  body: Record<string, unknown>,
  schema: ValidationSchema,
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];

    // Check required
    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push({ field, message: `${field} is required` });
      continue;
    }

    // Skip validation if not required and not provided
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }

    // Type validation
    switch (rules.type) {
      case "string":
        if (typeof value !== "string") {
          errors.push({ field, message: `${field} must be a string` });
          continue;
        }
        if (rules.min && value.length < rules.min) {
          errors.push({ field, message: `${field} must be at least ${rules.min} characters` });
        }
        if (rules.max && value.length > rules.max) {
          errors.push({ field, message: `${field} must be at most ${rules.max} characters` });
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push({ field, message: `${field} has invalid format` });
        }
        break;

      case "number":
        if (typeof value !== "number") {
          errors.push({ field, message: `${field} must be a number` });
          continue;
        }
        if (rules.min !== undefined && value < rules.min) {
          errors.push({ field, message: `${field} must be at least ${rules.min}` });
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push({ field, message: `${field} must be at most ${rules.max}` });
        }
        break;

      case "boolean":
        if (typeof value !== "boolean") {
          errors.push({ field, message: `${field} must be a boolean` });
        }
        break;

      case "email":
        if (typeof value !== "string") {
          errors.push({ field, message: `${field} must be a string` });
          continue;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push({ field, message: `${field} must be a valid email` });
        }
        break;

      case "url":
        if (typeof value !== "string") {
          errors.push({ field, message: `${field} must be a string` });
          continue;
        }
        try {
          new URL(value);
        } catch {
          errors.push({ field, message: `${field} must be a valid URL` });
        }
        break;
    }
  }

  return errors;
}

/**
 * Middleware wrapper for request validation
 * 
 * @example
 * ```typescript
 * export async function action({ request }: ActionFunctionArgs) {
 *   return withValidation(request, {
 *     email: { type: 'email', required: true },
 *     amount: { type: 'number', required: true, min: 0 },
 *   }, async (body) => {
 *     // Your action logic with validated body
 *     return Response.json({ success: true });
 *   });
 * }
 * ```
 */
export async function withValidation<T extends Record<string, unknown>>(
  request: Request,
  schema: ValidationSchema,
  handler: (body: T) => Promise<Response>,
): Promise<Response> {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        error: "Invalid JSON in request body",
        errors: [],
      },
      { status: 400 },
    );
  }

  const errors = validateBody(body, schema);

  if (errors.length > 0) {
    return Response.json(
      {
        error: "Validation failed",
        errors,
      },
      { status: 400 },
    );
  }

  return handler(body as T);
}

/**
 * Predefined validation schemas
 */
export const schemas = {
  assignPicker: {
    orderId: { type: "string" as const, required: true },
    pickerEmail: { type: "email" as const, required: true },
    totalPieces: { type: "number" as const, required: true, min: 1 },
  },
  recordPayment: {
    pickerEmail: { type: "email" as const, required: true },
    amountCents: { type: "number" as const, required: true, min: 1 },
    paidAt: { type: "string" as const, required: true },
    notes: { type: "string" as const, required: false, max: 500 },
  },
};

