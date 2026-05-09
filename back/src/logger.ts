type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

class Logger {
  private isDev = process.env.NODE_ENV !== "production";

  log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context })
    };

    const formatted = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${message}`;
    const output = context ? `${formatted} ${JSON.stringify(context)}` : formatted;

    if (level === "error") {
      console.error(output);
    } else if (level === "warn") {
      console.warn(output);
    } else if (this.isDev) {
      console.log(output);
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log("warn", message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log("error", message, context);
  }
}

export const logger = new Logger();
