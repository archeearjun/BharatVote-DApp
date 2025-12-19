// src/polyfills.ts
// Minimal Node-style globals for browser libs (ethers, merkletreejs, etc.)
import { Buffer } from 'buffer';

declare global {
  interface Window {
    Buffer?: typeof Buffer;
    process?: any;
    global?: any;
  }
}

if (typeof window !== 'undefined') {
  // Buffer
  if (!window.Buffer) window.Buffer = Buffer;

  // process (some deps expect process.env.* to exist)
  if (!window.process) window.process = { env: {} };

  // global (node-style alias)
  if (!window.global) window.global = window;
}

export {};
