/**
 * ZaynXwear — Central Production-Safe Logging System
 * 
 * Provides structured, privacy-safe, fail-safe logging across the frontend.
 * Automatically sanitizes sensitive credentials, masks PII, formats logs,
 * and asynchronously persists high-value milestones to Supabase app_logs.
 */
(function (global) {
  'use strict';

  // Log Levels
  const LOG_LEVELS = Object.freeze({
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  });

  const SENSITIVE_KEY_PATTERNS = [
    /pass(word)?/i,
    /token/i,
    /secret/i,
    /api[_-]?key/i,
    /auth(orization)?/i,
    /cookie/i,
    /cvv/i,
    /card[_-]?num/i,
    /pan/i,
    /upi[_-]?pin/i,
    /pin/i,
    /otp/i,
    /signature/i,
    /session/i
  ];

  // Check if debug mode is active
  const isDebugEnabled = () => {
    try {
      if (typeof window !== 'undefined') {
        if (window.ZAYNXWEAR_DEBUG === true) return true;
        if (window.localStorage && window.localStorage.getItem('zaynxwear:debug') === 'true') return true;
      }
    } catch {
      // Storage access may be restricted
    }
    return false;
  };

  /**
   * Deeply sanitizes metadata to remove or redact sensitive fields and PII.
   */
  const sanitizeValue = (key, value, depth = 0) => {
    if (depth > 6) return '[MAX_DEPTH]';
    if (value === null || value === undefined) return value;

    // Check sensitive key names
    if (key && typeof key === 'string' && SENSITIVE_KEY_PATTERNS.some(p => p.test(key))) {
      return '[REDACTED]';
    }

    // Sanitize string content
    if (typeof value === 'string') {
      const trimmed = value.trim();

      // Mask credit/debit card numbers (13-19 digits)
      if (/^\d{13,19}$/.test(trimmed.replace(/[\s-]/g, ''))) {
        return '[CARD_REDACTED]';
      }

      // Mask phone numbers (10 digits starting with 6-9 in India)
      if (/^[6-9]\d{9}$/.test(trimmed.replace(/[\s-]/g, ''))) {
        return '******' + trimmed.slice(-4);
      }

      // Mask email addresses (preserve first char and domain)
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        const parts = trimmed.split('@');
        const user = parts[0];
        const domain = parts[1];
        const maskedUser = user.length > 2 ? user[0] + '***' + user[user.length - 1] : user[0] + '***';
        return `${maskedUser}@${domain}`;
      }

      // Truncate overly long strings (e.g. base64 image data)
      if (trimmed.length > 1000) {
        return trimmed.slice(0, 500) + '... [TRUNCATED]';
      }

      return value;
    }

    // Handle Arrays
    if (Array.isArray(value)) {
      return value.slice(0, 50).map((item, idx) => sanitizeValue(String(idx), item, depth + 1));
    }

    // Handle Error Objects
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: isDebugEnabled() ? value.stack : undefined
      };
    }

    // Handle Plain Objects
    if (typeof value === 'object') {
      const cleanObj = {};
      const entries = Object.entries(value);
      for (const [k, v] of entries) {
        cleanObj[k] = sanitizeValue(k, v, depth + 1);
      }
      return cleanObj;
    }

    return value;
  };

  const sanitizeMetadata = (metadata) => {
    if (!metadata || typeof metadata !== 'object') return {};
    return sanitizeValue('', metadata);
  };

  // Queue for persistent log transmission
  const logQueue = [];
  let isFlushScheduled = false;

  /**
   * Fail-safe asynchronous transmission of queued logs to Supabase
   */
  const flushRemoteLogs = async () => {
    if (logQueue.length === 0) return;
    const batch = logQueue.splice(0, 20);

    try {
      const config = global.ZaynXwearAdminConfig || {};
      const supabaseUrl = config.supabaseUrl;
      const anonKey = config.supabaseAnonKey;

      if (!supabaseUrl || !anonKey) return; // Supabase not configured in this scope

      for (const logItem of batch) {
        // Send via Supabase RPC log_app_event
        fetch(`${supabaseUrl}/rest/v1/rpc/log_app_event`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`
          },
          body: JSON.stringify({
            p_level: logItem.level,
            p_event: logItem.event,
            p_source: logItem.source,
            p_metadata: logItem.metadata,
            p_error_message: logItem.error_message,
            p_order_id: logItem.order_id || null,
            p_user_id: logItem.user_id || null
          })
        }).catch(() => {
          // Fail-safe: Silently ignore network failures to prevent UI impact
        });
      }
    } catch {
      // Fail-safe: Never throw from background logger
    }
  };

  const scheduleFlush = () => {
    if (isFlushScheduled) return;
    isFlushScheduled = true;
    setTimeout(() => {
      isFlushScheduled = false;
      flushRemoteLogs();
    }, 2500);
  };

  /**
   * Central Core Logger Function
   */
  const createLogRecord = (levelName, event, metadata = {}, error = null, options = {}) => {
    try {
      const level = (levelName || 'INFO').toUpperCase();
      const currentLevelValue = LOG_LEVELS[level] !== undefined ? LOG_LEVELS[level] : LOG_LEVELS.INFO;

      // In production, suppress DEBUG logs unless debug mode is enabled
      if (currentLevelValue === LOG_LEVELS.DEBUG && !isDebugEnabled()) {
        return null;
      }

      const timestamp = new Date().toISOString();
      const source = options.source || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() || 'index.html' : 'server');
      const cleanMeta = sanitizeMetadata(metadata);
      const errorMsg = error ? (typeof error === 'string' ? error : (error.message || String(error))) : null;

      const record = {
        level,
        event: String(event || 'unnamed_event').toLowerCase(),
        source,
        timestamp,
        user_id: options.userId || null,
        order_id: options.orderId || cleanMeta.orderId || cleanMeta.order_id || null,
        metadata: cleanMeta,
        error_message: errorMsg
      };

      // 1. Console Presentation
      if (typeof console !== 'undefined') {
        const prefix = `[ZaynXwear][${level}] ${timestamp} | ${record.event}`;
        const consoleArgs = [prefix, record.metadata];
        if (error) consoleArgs.push(error);

        switch (level) {
          case 'DEBUG':
            if (console.debug) console.debug(...consoleArgs);
            else console.log(...consoleArgs);
            break;
          case 'INFO':
            if (console.info) console.info(...consoleArgs);
            else console.log(...consoleArgs);
            break;
          case 'WARN':
            if (console.warn) console.warn(...consoleArgs);
            else console.log(...consoleArgs);
            break;
          case 'ERROR':
            if (console.error) console.error(...consoleArgs);
            else console.log(...consoleArgs);
            break;
          default:
            console.log(...consoleArgs);
        }
      }

      // 2. Queue for Persistent Database Storage (INFO, WARN, ERROR)
      if (currentLevelValue >= LOG_LEVELS.INFO && options.remote !== false) {
        logQueue.push(record);
        if (logQueue.length >= 10 || level === 'ERROR') {
          flushRemoteLogs();
        } else {
          scheduleFlush();
        }
      }

      return record;
    } catch {
      // Fail-safe: Logging should never break caller operations
      return null;
    }
  };

  const logger = {
    LEVELS: LOG_LEVELS,

    debug: (event, metadata, options) => createLogRecord('DEBUG', event, metadata, null, options),
    info: (event, metadata, options) => createLogRecord('INFO', event, metadata, null, options),
    warn: (event, metadata, error, options) => createLogRecord('WARN', event, metadata, error, options),
    error: (event, metadata, error, options) => createLogRecord('ERROR', event, metadata, error, options),

    log: (level, event, metadata, error, options) => createLogRecord(level, event, metadata, error, options),
    flush: flushRemoteLogs,
    sanitize: sanitizeMetadata
  };

  // Global Unhandled Error Listeners (Fail-Safe)
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      try {
        logger.error('frontend_unhandled_error', {
          message: event.message,
          filename: event.filename ? event.filename.split('/').pop() : 'unknown',
          lineno: event.lineno,
          colno: event.colno
        }, event.error);
      } catch {
        // Silently ignore
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      try {
        const reason = event.reason;
        logger.error('frontend_unhandled_promise_rejection', {
          reason: typeof reason === 'string' ? reason : (reason?.message || 'Promise rejected')
        }, reason instanceof Error ? reason : null);
      } catch {
        // Silently ignore
      }
    });

    // Flush logs before user navigates away
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushRemoteLogs();
    });
    window.addEventListener('pagehide', flushRemoteLogs);
  }

  // Export to window/global
  global.ZaynXwearLogger = Object.freeze(logger);
  global.ECommerceDemoLogger = global.ZaynXwearLogger;
  global.logger = global.ZaynXwearLogger;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = logger;
  }
})(typeof window !== 'undefined' ? window : globalThis);
