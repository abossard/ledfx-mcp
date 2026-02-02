/**
 * Logger utility for LedFX MCP Server
 * 
 * All output goes to stderr to avoid interfering with MCP stdio protocol.
 * 
 * Following "Grokking Simplicity":
 * - These are actions (perform I/O)
 * - Centralized logging makes debugging easier
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogConfig {
  level: LogLevel;
  timestamps: boolean;
  prefix: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Configuration from environment
const config: LogConfig = {
  level: (process.env.LEDFX_LOG_LEVEL as LogLevel) || "info",
  timestamps: process.env.LEDFX_LOG_TIMESTAMPS !== "false",
  prefix: "[LedFX-MCP]",
};

/**
 * Format a log message with optional timestamp
 */
function formatMessage(level: LogLevel, message: string, data?: unknown): string {
  const parts: string[] = [];
  
  if (config.timestamps) {
    parts.push(new Date().toISOString());
  }
  
  parts.push(config.prefix);
  parts.push(`[${level.toUpperCase()}]`);
  parts.push(message);
  
  if (data !== undefined) {
    if (typeof data === "object") {
      parts.push(JSON.stringify(data, null, 2));
    } else {
      parts.push(String(data));
    }
  }
  
  return parts.join(" ");
}

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[config.level];
}

/**
 * Log a debug message (action)
 */
export function debug(message: string, data?: unknown): void {
  if (shouldLog("debug")) {
    console.error(formatMessage("debug", message, data));
  }
}

/**
 * Log an info message (action)
 */
export function info(message: string, data?: unknown): void {
  if (shouldLog("info")) {
    console.error(formatMessage("info", message, data));
  }
}

/**
 * Log a warning message (action)
 */
export function warn(message: string, data?: unknown): void {
  if (shouldLog("warn")) {
    console.error(formatMessage("warn", message, data));
  }
}

/**
 * Log an error message (action)
 */
export function error(message: string, data?: unknown): void {
  if (shouldLog("error")) {
    console.error(formatMessage("error", message, data));
  }
}

/**
 * Log an HTTP request (action)
 */
export function httpRequest(method: string, url: string, body?: unknown): void {
  if (shouldLog("debug")) {
    const msg = `→ ${method} ${url}`;
    if (body) {
      debug(msg, body);
    } else {
      debug(msg);
    }
  }
}

/**
 * Log an HTTP response (action)
 */
export function httpResponse(method: string, url: string, status: number, durationMs: number, body?: unknown): void {
  const level = status >= 400 ? "warn" : "debug";
  const msg = `← ${method} ${url} [${status}] (${durationMs}ms)`;
  
  if (shouldLog(level)) {
    if (level === "warn" || (shouldLog("debug") && body)) {
      console[level === "warn" ? "error" : "error"](formatMessage(level, msg, body));
    } else {
      console.error(formatMessage(level, msg));
    }
  }
}

/**
 * Log a tool call (action)
 */
export function toolCall(name: string, args: Record<string, unknown>): void {
  info(`Tool call: ${name}`, args);
}

/**
 * Log a tool result (action)
 */
export function toolResult(name: string, success: boolean, durationMs: number, result?: unknown): void {
  const level = success ? "debug" : "warn";
  const msg = `Tool result: ${name} [${success ? "OK" : "FAILED"}] (${durationMs}ms)`;
  
  if (shouldLog(level)) {
    if (!success && result) {
      console.error(formatMessage(level, msg, result));
    } else {
      console.error(formatMessage(level, msg));
    }
  }
}

/**
 * Log server lifecycle event (action)
 */
export function lifecycle(event: string, details?: unknown): void {
  info(`Server: ${event}`, details);
}

/**
 * Create a child logger with a specific component prefix
 */
export function createLogger(component: string) {
  return {
    debug: (message: string, data?: unknown) => debug(`[${component}] ${message}`, data),
    info: (message: string, data?: unknown) => info(`[${component}] ${message}`, data),
    warn: (message: string, data?: unknown) => warn(`[${component}] ${message}`, data),
    error: (message: string, data?: unknown) => error(`[${component}] ${message}`, data),
  };
}

export const logger = {
  debug,
  info,
  warn,
  error,
  httpRequest,
  httpResponse,
  toolCall,
  toolResult,
  lifecycle,
  createLogger,
};

export default logger;
