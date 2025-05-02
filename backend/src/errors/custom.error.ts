export class CustomError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = "CustomError";
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string) {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends CustomError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class InternalServerError extends CustomError {
  constructor(message: string = "Internal Server Error") {
    super(message, 500, "INTERNAL_SERVER_ERROR");
  }
}
