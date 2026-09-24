'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { greet, main } = require('../src/index');

test('main function is exported and is a function', () => {
  assert.strictEqual(typeof main, 'function');
});

test('greet function is exported and returns a greeting containing the name', () => {
  assert.strictEqual(typeof greet, 'function');
  assert.strictEqual(greet('Trae'), 'Hello, Trae!');
  assert.strictEqual(greet('World'), 'Hello, World!');
});
