// config.js - API Configuration
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxVZy-biQDZAETUWVW5DoQGYbbkBGeYI2dqbYPJKv9zyy0yuXtCnieluUya0aBpc8iPVg/exec';

// App configuration
const APP_CONFIG = {
    apiUrl: APP_SCRIPT_URL,
    appName: 'Udharo Tracker',
    version: '1.0.0'
};

// Export for use in other files (for modern browsers)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APP_SCRIPT_URL, APP_CONFIG };
}
