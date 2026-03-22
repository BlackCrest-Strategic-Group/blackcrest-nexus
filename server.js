const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'frontend', 'dist');

// Check if the dist directory exists
if (!fs.existsSync(distDir)) {
    console.error(`[ERROR] The dist directory does not exist: ${distDir}`);
    // You could handle this case further, for example:
    // notify the user, or fallback to a default behavior  
}

// Add further application logic here

// Example of logging for application start
console.log(`[INFO] Application has started successfully, checking the dist directory at: ${distDir}`);