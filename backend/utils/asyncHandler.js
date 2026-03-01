/**
 * Wraps async route handlers to catch errors and pass them to Express error middleware.
 * Eliminates the need for manual try/catch in controllers.
 */
export function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
