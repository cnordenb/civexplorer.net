export function attempt(action) {
  try {
    return action();
  } catch (error) {
    if (error instanceof DOMException) return null;
    throw error;
  }
}
