import { GraphQLError } from "graphql";

export class AppError extends GraphQLError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    // The second param is treated as the "nodes" argument, but
    // to safely pass an options object, pass it as third param
    super(message, undefined, undefined, undefined, undefined, undefined, {
      code:
        statusCode === 401
          ? "UNAUTHENTICATED"
          : statusCode === 400
            ? "BAD_USER_INPUT"
            : "INTERNAL_SERVER_ERROR",
      statusCode,
      isOperational,
    });

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid input") {
    super(message, 400);
  }
}
