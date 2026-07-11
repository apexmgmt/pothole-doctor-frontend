type AnyFn = (...args: any[]) => void;

/**
 * Creates a debounced version of a function.
 * The function execution is delayed until after the specified delay (default 400ms)
 * has passed since the last time it was invoked.
 *
 * Useful for limiting frequent calls (e.g., search input, resize events).
 *
 * @example
 * const handleSearch = debounce((value: string) => {
 *   console.log('Searching:', value);
 * }, 500);
 *
 * handleSearch('r');
 * handleSearch('re');
 * handleSearch('rea');
 * // Only the last call runs after 500ms
 */
const debounce = <T extends AnyFn>(func: T, delay: number = 400) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Parameters<T>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };

  debounced.cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  return debounced;
};

export default debounce;
