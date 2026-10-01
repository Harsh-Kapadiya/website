import { test } from 'node:test';
import assert from 'node:assert/strict';

test('notifyOwner sends via Resend when RESEND_API_KEY is set', async () => {
  process.env.RESEND_API_KEY = 're_test';
  process.env.OWNER_EMAIL = 'owner@example.com';
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response('{"id":"1"}', { status: 200 });
  };
  const { notifyOwner, mailerConfigured } = await import('../src/mailer.js');
  assert.equal(mailerConfigured, true);

  await notifyOwner({ subject: 'Hi\r\nBcc: x@evil.com', text: 'body', replyTo: 'v@example.com' });
  const body = JSON.parse(calls[0].init.body);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer re_test');
  assert.equal(body.to, 'owner@example.com');
  assert.equal(body.subject, 'Hi Bcc: x@evil.com'); // header injection flattened
  assert.equal(body.reply_to, 'v@example.com');

  globalThis.fetch = async () => new Response('bad key', { status: 403 });
  await assert.rejects(notifyOwner({ subject: 's', text: 't' }), /Resend 403/);
});
