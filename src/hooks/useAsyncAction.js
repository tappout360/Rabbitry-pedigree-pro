import { useState, useCallback } from 'react';

/**
 * Reusable hook to handle asynchronous actions with loading, error states, and automatic try/catch wrapping.
 * Allows passing an optional toast function for success/error feedback.
 */
export function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFn, { successMessage, errorMessage, showToast } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      if (successMessage && showToast) {
        showToast(successMessage, 'success');
      }
      return { success: true, data: result };
    } catch (err) {
      console.error("Async action error:", err);
      const msg = err.message || 'Operation failed';
      setError(msg);
      if (showToast) {
        showToast(errorMessage ? `${errorMessage}: ${msg}` : msg, 'error');
      }
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}
