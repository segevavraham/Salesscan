import { useState, useCallback } from 'react';

interface AsyncState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
}

interface UseAsyncActionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  successDuration?: number;
}

export function useAsyncAction<T extends (...args: any[]) => Promise<any>>(
  asyncFunction: T,
  options: UseAsyncActionOptions = {}
) {
  const { onSuccess, onError, successDuration = 2000 } = options;

  const [state, setState] = useState<AsyncState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Parameters<T>) => {
      setState({ isLoading: true, isSuccess: false, isError: false, error: null });

      try {
        const result = await asyncFunction(...args);

        setState({ isLoading: false, isSuccess: true, isError: false, error: null });

        // Auto-reset success state after duration
        setTimeout(() => {
          setState((prev) => ({ ...prev, isSuccess: false }));
        }, successDuration);

        if (onSuccess) {
          onSuccess();
        }

        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('An error occurred');

        setState({ isLoading: false, isSuccess: false, isError: true, error: err });

        if (onError) {
          onError(err);
        }

        throw err;
      }
    },
    [asyncFunction, onSuccess, onError, successDuration]
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, isSuccess: false, isError: false, error: null });
  }, []);

  return {
    execute,
    reset,
    ...state,
  };
}

// Example usage:
// const { execute, isLoading, isSuccess, isError } = useAsyncAction(saveUser, {
//   onSuccess: () => showNotification('User saved!', 'success'),
//   onError: (err) => showNotification(err.message, 'error'),
// });
//
// <Button onClick={() => execute(userData)} disabled={isLoading}>
//   {isLoading ? <CircularProgress size={20} /> : isSuccess ? <Check /> : 'Save'}
// </Button>
