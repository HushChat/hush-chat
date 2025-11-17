/**
 * Centralized logging utility for the entire React Native application.
 *
 * WHY THIS EXISTS:
 * - Prevents raw console.log usage across the codebase.
 * - Keeps ESLint rules strict while still allowing console output in development.
 * - Makes it easy to integrate GlitchTip/Sentry or any other monitoring tool later.
 * - Ensures consistent logging behavior across all modules.
 *
 * NOTE:
 * - In development (`__DEV__ === true`), logs print to the developer console.
 * - In production, these functions will later send events to GlitchTip/Sentry.
 * - DO NOT call console.* directly in feature code — always use these helpers.
 */

/**
 * Log informational messages.
 *
 * Use this for general debugging information that helps during development,
 */
export const logInfo = (...args: any[]) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.info(...args);
  }
};

/**
 * Log warnings.
 *
 * Use this for unexpected situations that are not fatal
 * but worth noticing (e.g., fallback behavior, missing data, optional failures).
 *
 */
export const logWarn = (...args: any[]) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
};

/**
 * Log errors.
 *
 * Use this for:
 * - API failures
 * - unexpected behavior
 * - exceptions caught in try/catch blocks
 *
 */
export const logError = (...args: any[]) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
};

/**
 * Log debug messages.
 *
 * Use this for low-level debugging information
 * that is useful during development but not needed in production.
 */
export const logDebug = (...args: any[]) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};
