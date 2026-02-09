export function normalizeError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    const message = error.message;
    
    // Handle authorization errors
    if (message.includes('Unauthorized') || message.includes('Only')) {
      return message;
    }
    
    // Handle not found errors
    if (message.includes('not found')) {
      return message;
    }
    
    // Handle network errors
    if (message.includes('fetch') || message.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    return message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

export function isRetryableError(error: unknown): boolean {
  const message = normalizeError(error);
  return message.includes('Network') || message.includes('connection') || message.includes('timeout');
}
