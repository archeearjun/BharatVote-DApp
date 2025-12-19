// Polyfills for Node.js globals in browser environment
// These are required for blockchain libraries like ethers.js and merkletreejs
import 'buffer';

// Ensure Buffer is available globally
if (typeof window !== 'undefined') {
  // @ts-ignore
  if (!window.Buffer) {
    // @ts-ignore
    window.Buffer = (globalThis as any).Buffer;
  }
  
  // Ensure process is available for some libraries
  if (!window.process) {
    // @ts-ignore
    window.process = { env: {} };
  }
  
  // Ensure global is available
  if (!window.global) {
    // @ts-ignore
    window.global = window;
  }
  
  // Additional Buffer polyfill for merkletreejs
  if (typeof (globalThis as any).Buffer !== 'undefined') {
    (window as any).Buffer = (globalThis as any).Buffer;
  }
  
  // Fallback: if Buffer is still not available, try to get it from the buffer package
  if (!(window as any).Buffer && typeof Buffer !== 'undefined') {
    (window as any).Buffer = Buffer;
  }
  
  // Final check and log
  if ((window as any).Buffer) {
    console.log('✓ Polyfills: Buffer successfully polyfilled');
  } else {
    console.error('✗ Polyfills: Failed to polyfill Buffer!');
  }
}

export {};

