export const logger = {
  log: (message, data = {}) => {
    console.log(`[LOG] ${new Date().toISOString()} - ${message}`, data);
  },

  error: (message, error = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  },

  warn: (message, data = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
  },

  info: (message, data = {}) => {
    console.info(`[INFO] ${new Date().toISOString()} - ${message}`, data);
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
    }
  },
};

export default logger;
