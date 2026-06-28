import '@testing-library/jest-dom';

// JSDOM does not provide standard Web APIs such as TextDecoder, TextEncoder, setImmediate.
// Next.js and its libraries require these globally.
const util = require('util');
if (typeof global.TextDecoder === 'undefined') {
  // @ts-ignore
  global.TextDecoder = util.TextDecoder;
}
if (typeof global.TextEncoder === 'undefined') {
  // @ts-ignore
  global.TextEncoder = util.TextEncoder;
}

if (typeof global.setImmediate === 'undefined') {
  // @ts-ignore
  global.setImmediate = globalThis.setImmediate || require('timers').setImmediate;
}
if (typeof global.clearImmediate === 'undefined') {
  // @ts-ignore
  global.clearImmediate = globalThis.clearImmediate || require('timers').clearImmediate;
}

// Next.js client imports require Request, Response, Headers. We load them from edge-runtime primitives.
const primitives = require('next/dist/compiled/@edge-runtime/primitives');

if (typeof global.Request === 'undefined' || global.Request === undefined) {
  // @ts-ignore
  global.Request = primitives.Request;
}
if (typeof global.Response === 'undefined' || global.Response === undefined) {
  // @ts-ignore
  global.Response = primitives.Response;
}
if (typeof global.Headers === 'undefined' || global.Headers === undefined) {
  // @ts-ignore
  global.Headers = primitives.Headers;
}
