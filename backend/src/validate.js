// One small declarative validator for the two public forms.
// ponytail: hand-rolled instead of zod — two schemas don't justify a dependency.

// Same rule browsers use for <input type="email"> (WHATWG). Rejects quotes,
// comments, address literals, raw unicode and CR/LF before nodemailer ever sees it.
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;
const CONTROL_CHARS_EXCEPT_NEWLINE_TAB = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

// `website` is a honeypot: hidden from humans, bots fill it in.
export const contactSpec = {
  name: { required: true, max: 100 },
  email: { required: true, max: 254, email: true },
  message: { required: true, max: 5000, multiline: true },
  website: { max: 200 },
};

export const feedbackSpec = {
  author: { required: true, max: 100 },
  role: { max: 120 },
  quote: { required: true, max: 1000, multiline: true },
  rating: { required: true, int: [1, 5] },
  website: { max: 200 },
};

export function validate(body, spec) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'INVALID_BODY' };
  for (const key of Object.keys(body)) {
    if (!Object.hasOwn(spec, key)) return { error: 'UNKNOWN_FIELD', field: key };
  }

  const data = {};
  for (const [key, rule] of Object.entries(spec)) {
    let value = body[key];

    if (value === undefined || value === null || value === '') {
      if (rule.required) return { error: 'MISSING_FIELD', field: key };
      data[key] = null;
      continue;
    }

    if (rule.int) {
      const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
      if (!Number.isInteger(n) || n < rule.int[0] || n > rule.int[1]) return { error: 'INVALID_FIELD', field: key };
      data[key] = n;
      continue;
    }

    if (typeof value !== 'string') return { error: 'INVALID_FIELD', field: key };
    if (value.length > rule.max * 2) return { error: 'FIELD_TOO_LONG', field: key }; // cheap guard before normalizing

    value = value.normalize('NFC').trim();
    if (rule.multiline) value = value.replace(CONTROL_CHARS_EXCEPT_NEWLINE_TAB, '');
    else if (CONTROL_CHARS.test(value)) return { error: 'INVALID_FIELD', field: key };

    if (!value) {
      if (rule.required) return { error: 'MISSING_FIELD', field: key };
      data[key] = null;
      continue;
    }
    if (value.length > rule.max) return { error: 'FIELD_TOO_LONG', field: key };
    if (rule.email && !EMAIL_RE.test(value)) return { error: 'INVALID_FIELD', field: key };

    data[key] = value;
  }
  return { data };
}

// Stable, human-readable messages. Never includes database/provider details.
export function publicMessage(error, field) {
  if (error === 'MISSING_FIELD') return `Please fill in the ${field} field.`;
  if (error === 'FIELD_TOO_LONG') return `The ${field} field is too long.`;
  if (error === 'INVALID_FIELD') return `Please check the ${field} field.`;
  if (error === 'UNKNOWN_FIELD') return 'Unexpected form data.';
  return 'Invalid request.';
}
