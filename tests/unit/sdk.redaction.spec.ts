import { describe, it, expect, vi } from 'vitest';
import { logStructured } from '../../app/agents/sdk/index';

describe('SDK logStructured redaction', () => {
  it('redacts emails, phones, and order numbers', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logStructured('info', 'Contact me at test@example.com about order #12345', { phone: '+1 (555) 123-4567', email: 'user@site.com' });
    const payload = JSON.parse((spy.mock.calls[0][0] as string));
    expect(payload.message).not.toContain('@');
    expect(payload.message).not.toContain('#12345');
    expect(String(payload.phone)).not.toContain('555');
    expect(String(payload.email)).not.toContain('@');
    spy.mockRestore();
  });
});

