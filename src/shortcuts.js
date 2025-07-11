export function registerShortcuts({ addItem, printBill, clearBill, focusItemInput }) {
  function handler(e) {
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      printBill();
    }
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      clearBill();
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      focusItemInput();
    }
    // Add more as needed
  }
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}
