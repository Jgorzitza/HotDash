import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import crypto from 'crypto';
import { hmacValidation, webhookRateLimit } from './hmac-validation';

describe('HMAC Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockReq = {
      headers: {},
      body: { test: 'data' },
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    
    // Set test secret
    process.env.TEST_WEBHOOK_SECRET = 'test-secret-key';
  });

  it('should pass with valid HMAC signature', () => {
    const rawBody = JSON.stringify(mockReq.body);
    const validSignature = crypto
      .createHmac('sha256', 'test-secret-key')
      .update(rawBody)
      .digest('hex');

    mockReq.headers = {
      'x-webhook-signature': validSignature,
    };

    const middleware = hmacValidation('TEST_WEBHOOK_SECRET');
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should fail with invalid signature', () => {
    mockReq.headers = {
      'x-webhook-signature': 'invalid-signature',
    };

    const middleware = hmacValidation('TEST_WEBHOOK_SECRET');
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid signature' });
  });

  it('should fail with missing signature', () => {
    const middleware = hmacValidation('TEST_WEBHOOK_SECRET');
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing signature' });
  });

  it('should fail with expired timestamp', () => {
    const rawBody = JSON.stringify(mockReq.body);
    const validSignature = crypto
      .createHmac('sha256', 'test-secret-key')
      .update(rawBody)
      .digest('hex');

    // Timestamp 10 minutes ago (outside 5 min tolerance)
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 600;

    mockReq.headers = {
      'x-webhook-signature': validSignature,
      'x-webhook-timestamp': expiredTimestamp.toString(),
    };

    const middleware = hmacValidation('TEST_WEBHOOK_SECRET');
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Request expired' });
  });

  it('should detect replay attacks with duplicate nonce', () => {
    const rawBody = JSON.stringify(mockReq.body);
    const validSignature = crypto
      .createHmac('sha256', 'test-secret-key')
      .update(rawBody)
      .digest('hex');

    const nonce = 'unique-nonce-123';
    mockReq.headers = {
      'x-webhook-signature': validSignature,
      'x-webhook-nonce': nonce,
    };

    const nonceStore = new Set<string>();
    const middleware = hmacValidation('TEST_WEBHOOK_SECRET', { nonceStore });

    // First request - should pass
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();

    // Reset mocks
    vi.clearAllMocks();

    // Second request with same nonce - should fail
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Duplicate request' });
  });
});

describe('Webhook Rate Limiting', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockReq = {
      ip: '192.168.1.1',
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  it('should allow requests within limit', () => {
    const middleware = webhookRateLimit(5, 60000);

    for (let i = 0; i < 5; i++) {
      middleware(mockReq as Request, mockRes as Response, mockNext);
    }

    expect(mockNext).toHaveBeenCalledTimes(5);
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should block requests exceeding limit', () => {
    const middleware = webhookRateLimit(3, 60000);

    // First 3 requests should pass
    for (let i = 0; i < 3; i++) {
      middleware(mockReq as Request, mockRes as Response, mockNext);
    }
    expect(mockNext).toHaveBeenCalledTimes(3);

    // 4th request should be blocked
    vi.clearAllMocks();
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(429);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Too many requests' });
  });
});

