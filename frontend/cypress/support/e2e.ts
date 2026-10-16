// ***********************************************************
// Cypress Support Entry Point
// ***********************************************************

import 'cypress-axe';
import './commands';

// Ignore benign third-party or VLibras external script errors
Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes('VLibras') ||
    err.message.includes('ResizeObserver') ||
    err.message.includes('speechSynthesis')
  ) {
    return false;
  }
  return true;
});
