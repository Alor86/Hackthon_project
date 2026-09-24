'use strict';

function greet(name) {
  return `Hello, ${name}!`;
}

function main() {
  try {
    console.log('Project foundation is running successfully.');
    console.log('Ready for feature development.');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during startup:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { greet, main };
