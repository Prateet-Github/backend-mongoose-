class ApiError extends Error {
  constructor(message = 'something went wrong', statusCode, errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;
    this.message = message

  }}
    
// if (stack) {
//       this.stack = stack;
//     }
//     else {
//       Error.captureStackTrace(this, this.constructor);
//     }


// const asyncHandler = (requestHandler) => {
//   return (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((err) => {
//       res.status(err.code || 500).json({
//         success: false,
//         message: err.message,
//       })
//     })
//   }
// }

export { ApiError }
// export { asyncHandler }