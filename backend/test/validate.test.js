import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate, contactSpec, feedbackSpec } from '../src/validate.js';

const ok = { name: 'Asha', email: 'asha@example.com', message: 'Hi\nthere' };

test('valid contact passes and is trimmed', () => {
  const r = validate({ ...ok, name: '  Asha ' }, contactSpec);
  assert.equal(r.data.name, 'Asha');
  assert.equal(r.data.message, 'Hi\nthere');
});

test('unknown fields, arrays, non-objects rejected', () => {
  assert.equal(validate({ ...ok, admin: true }, contactSpec).error, 'UNKNOWN_FIELD');
  assert.equal(validate([ok], contactSpec).error, 'INVALID_BODY');
  assert.equal(validate(null, contactSpec).error, 'INVALID_BODY');
  assert.equal(validate({ ...ok, name: { $gt: '' } }, contactSpec).error, 'INVALID_FIELD');
});

test('size limits enforced', () => {
  assert.equal(validate({ ...ok, name: 'a'.repeat(101) }, contactSpec).error, 'FIELD_TOO_LONG');
  assert.equal(validate({ ...ok, message: 'a'.repeat(5001) }, contactSpec).error, 'FIELD_TOO_LONG');
  assert.equal(validate({ ...ok, message: 'a'.repeat(5000) }, contactSpec).error, undefined);
});

test('hostile email addresses never reach nodemailer', () => {
  for (const email of [
    'a@b.com\r\nBcc: victim@x.com',
    '"quoted"@example.com',
    'a(comment)@example.com',
    'user@[127.0.0.1]',
    'nodomain@',
    'a@b',
    'ünïcode@exämple.com',
    'a,b@example.com',
    'Name <a@example.com>',
    `${'a'.repeat(250)}@example.com`,
  ]) {
    assert.ok(validate({ ...ok, email }, contactSpec).error, `should reject: ${JSON.stringify(email)}`);
  }
  assert.equal(validate({ ...ok, email: 'first.last+tag@sub.example.co.in' }, contactSpec).error, undefined);
});

test('control characters: rejected in single-line, stripped in multiline', () => {
  assert.equal(validate({ ...ok, name: 'A\u0000B' }, contactSpec).error, 'INVALID_FIELD');
  assert.equal(validate({ ...ok, message: 'x\u0007y' }, contactSpec).data.message, 'xy');
});

test('missing / whitespace-only required fields rejected', () => {
  assert.equal(validate({ email: ok.email, message: 'm' }, contactSpec).error, 'MISSING_FIELD');
  assert.equal(validate({ ...ok, name: '   ' }, contactSpec).error, 'MISSING_FIELD');
});

test('feedback rating must be an integer 1-5', () => {
  const base = { author: 'Ravi', quote: 'Great work' };
  for (const rating of [0, 6, 2.5, '3x', true, [5]]) {
    assert.equal(validate({ ...base, rating }, feedbackSpec).error, 'INVALID_FIELD', String(rating));
  }
  assert.equal(validate({ ...base, rating: '5' }, feedbackSpec).data.rating, 5);
  assert.equal(validate({ ...base, rating: 4, role: '' }, feedbackSpec).data.role, null);
});

test('honeypot passes through validation so the route can drop it', () => {
  assert.equal(validate({ ...ok, website: 'http://spam' }, contactSpec).data.website, 'http://spam');
});
