/*
 * Simple project-scoped logger utilities.
 * - Exports `CNPLogger` (default) and `ProxyLogger` for proxy-specific logs.
 * - Non-error levels are silenced when the logger is configured for production.
 */
// type LogLevel = "info" | "warn" | "error" | "debug";

/**
 * Lightweight logger class used across the project.
 * - When constructed with `debug: true`, logs are enabled (non-production mode).
 * - `enableDebugging` can toggle logging at runtime.
 * - `info`, `warn`, `debug` respect the production flag; `error` always logs.
 */
class Logger {
	private isProduction: boolean = false;
	private context: string = "LOGGER";

	/**
	 * Create a new Logger instance bound to a context label.
	 * @param debug When true, enables console output for non-error levels
	 * @param context A short label to include with each log message
	 */
	constructor(debug: boolean, context: string) {
		this.isProduction = !debug;
		this.context = context;
	}

	/**
	 * Toggle debugging (non-production) mode at runtime.
	 * @param enable `true` to enable debug logs; `false` to silence them
	 */
	public enableDebugging(enable: boolean): void {
		this.isProduction = !enable;
	}

	private format(level: string, message: string): string {
		return `[${this.context}] [${level.toUpperCase()}] ${message}`;
	}

	/**
	 * Log an informational message when debugging is enabled.
	 */
	public info(message: string, ...optionalParams: unknown[]): void {
		if (!this.isProduction) {
			console.log(this.format("info", message), ...optionalParams);
		}
	}

	/**
	 * Log a warning message when debugging is enabled.
	 */
	public warn(message: string, ...optionalParams: unknown[]): void {
		if (!this.isProduction) {
			console.warn(this.format("warn", message), ...optionalParams);
		}
	}

	/**
	 * Always log an error message.
	 */
	public error(message: string, ...optionalParams: unknown[]): void {
		console.error(this.format("error", message), ...optionalParams);
	}

	/**
	 * Log a debug message when debugging is enabled.
	 */
	public debug(message: string, ...optionalParams: unknown[]): void {
		if (!this.isProduction) {
			console.debug(this.format("debug", message), ...optionalParams);
		}
	}
}

/**
 * Default LOGGER FOR PACKAGE!!!.
 */
const CNPLogger = new Logger(false, "CNP");

/**
 * A project-scoped proxy logger for HLS proxy-related messages.
 */
const ProxyLogger = new Logger(false, "HLS_PROXY");

export { ProxyLogger, CNPLogger };
