export function createError(code, message, details = {}) {
  return {
    error: {
      code,
      message,
      details
    }
  };
}
