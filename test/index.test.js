'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { main } = require('../src/index');

test('main function is exported and is a function', () => {
  assert.strictEqual(typeof main, 'function');
});
