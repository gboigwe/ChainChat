/**
 * Logging Service
 */

class Logger {
  log(level, message, context) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`, context || '');
  }

  info(message, context) {
    this.log('INFO', message, context);
  }

  warn(message, context) {
    this.log('WARN', message, context);
  }

  error(message, context) {
    this.log('ERROR', message, context);
  }
}

export default new Logger();
