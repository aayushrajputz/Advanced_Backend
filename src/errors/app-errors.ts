export class AppError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode: number,
        public readonly isOperational: boolean,

    ) {
        super(message)
        // Pro-Tip: Prototype chain ko correct restore karne ke liye (JS inheritance quirks)
        Object.setPrototypeOf(this, new.target.prototype);

        Error.captureStackTrace(this, this.constructor);
    }
}


export class BadRequestError extends AppError {
    constructor(message: string = " Bad Request") {
        super(message, 400, true)
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Not Found") {
        super(message, 404, true)
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = " Internal Server Error") {
        super(message, 500, false)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized") {
        super(message, 401, true)
    }
}