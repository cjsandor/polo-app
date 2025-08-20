// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add additional configuration
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// Improve error reporting
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Log errors for debugging
      if (req.url.includes('symbolicate')) {
        console.log('Symbolicate request:', req.url);
      }
      return middleware(req, res, next);
    };
  },
};

// Reset cache on start
config.resetCache = true;

module.exports = config;
