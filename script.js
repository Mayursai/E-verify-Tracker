// script.js
// Simple JavaScript file created by GitHub Copilot
function greet(name) {
  return `Hello, ${name || 'world'}!`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { greet };
} else {
  console.log(greet());
}
