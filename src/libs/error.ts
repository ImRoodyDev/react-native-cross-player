import {sanitizeMessage} from '../utils/helpers';

export interface CustomPlayerErrorPayload<TErrorDetails = unknown> {
	code: string;
	message: string;
	details?: TErrorDetails;
	status?: number;
}

/**
 * Custom Process Error class for structured error handling in internal processes
 * @template TErrorDetails - Type for additional error details (can be any type)
 * @extends Error - Built-in JavaScript Error class
 * @example
 * throw new ProcessError({
 *   code: 'VALIDATION_FAILED',
 *   message: 'User data validation failed',
 *   details: { field: 'email', reason: 'invalid format' },
 *   expose: false
 *   status: 400
 * });
 */
export class CustomPlayerError<TErrorDetails = unknown> extends Error {
	/** Unique error code identifier (e.g., 'VALIDATION_ERROR', 'NOT_FOUND') */
	public readonly code: string;

	/** Additional error details with type safety via generics */
	public readonly details?: TErrorDetails;

	/** Optional HTTP status code associated with the error (e.g., 400, 500) */
	public readonly status?: number;

	/**
	 * Creates a new ProcessError instance
	 * @param payload - Error configuration object containing all error properties
	 */
	constructor(payload: CustomPlayerErrorPayload<TErrorDetails>) {
		// Call parent Error constructor with the error message
		super(sanitizeMessage(payload.message));

		// Set the error name for better stack traces and debugging
		this.name = 'PlayerError';

		// Assign the unique error code
		this.code = payload.code;

		// Assign additional error details
		this.details = payload.details;

		// Assign optional HTTP status code
		this.status = payload.status;

		// Capture the stack trace for debugging (maintains proper stack trace in V8 engines)
		Error.captureStackTrace?.(this, CustomPlayerError);
	}

	public stateMessage(): string[] {
		return [this.code, this.message];
	}
}

/**
 * Type guard to check if an error is an instance of ProcessError
 * Useful for error handling logic to distinguish ProcessError from other error types
 * @param error - The error to check
 * @returns True if the error is a ProcessError instance, false otherwise
 * @example
 * try {
 *   // some code
 * } catch (error) {
 *   if (isProcessError(error)) {
 *     console.log(error.code, error.details);
 *   }
 * }
 */
export const isCustomPlayerError = (error: unknown): error is CustomPlayerError => error instanceof CustomPlayerError;
