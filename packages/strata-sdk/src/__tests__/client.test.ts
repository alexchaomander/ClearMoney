import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StrataClient, StrataApiError } from '../client';
import { isValidVIN } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockFetchResponse(body: unknown, status = 200, statusText = 'OK') {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: vi.fn().mockResolvedValue(body),
  });
}

function mockFetch204() {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 204,
    statusText: 'No Content',
    json: vi.fn(),
  });
}

function mockFetchError(status: number, detail?: string) {
  const body = detail ? { detail } : {};
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText: 'Bad Request',
    json: vi.fn().mockResolvedValue(body),
  });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('StrataApiError', () => {
  it('should set name, status, message, and detail', () => {
    const err = new StrataApiError(404, 'Not found', 'Resource missing');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('StrataApiError');
    expect(err.status).toBe(404);
    expect(err.message).toBe('Not found');
    expect(err.detail).toBe('Resource missing');
  });

  it('should allow detail to be undefined', () => {
    const err = new StrataApiError(500, 'Server error');
    expect(err.detail).toBeUndefined();
  });
});

describe('StrataClient', () => {
  let client: StrataClient;

  beforeEach(() => {
    client = new StrataClient({
      baseUrl: 'https://api.example.com',
      clerkUserId: 'user_123',
      authToken: 'tok_abc',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Construction ────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('should strip trailing slashes from baseUrl', () => {
      const c = new StrataClient({ baseUrl: 'https://api.example.com///' });
      // Verify by calling a method and inspecting the fetch URL
      globalThis.fetch = mockFetchResponse({ status: 'ok' });
      c.healthCheck();
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/health',
        expect.any(Object),
      );
    });

    it('should default clerkUserId and authToken to null', () => {
      const c = new StrataClient({ baseUrl: 'https://api.example.com' });
      globalThis.fetch = mockFetchResponse({ status: 'ok' });
      c.healthCheck();
      const headers = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
      expect(headers).not.toHaveProperty('X-Clerk-User-Id');
      expect(headers).not.toHaveProperty('Authorization');
    });
  });

  // ── Auth headers ────────────────────────────────────────────────────────

  describe('auth headers', () => {
    it('should send both X-Clerk-User-Id and Authorization when both are set', () => {
      globalThis.fetch = mockFetchResponse({ status: 'ok' });
      client.healthCheck();
      const headers = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
      expect(headers['X-Clerk-User-Id']).toBe('user_123');
      expect(headers['Authorization']).toBe('Bearer tok_abc');
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should send only X-Clerk-User-Id when authToken is not set', () => {
      const c = new StrataClient({ baseUrl: 'https://api.example.com', clerkUserId: 'user_456' });
      globalThis.fetch = mockFetchResponse({});
      c.healthCheck();
      const headers = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
      expect(headers['X-Clerk-User-Id']).toBe('user_456');
      expect(headers).not.toHaveProperty('Authorization');
    });

    it('should send only Authorization when clerkUserId is not set', () => {
      const c = new StrataClient({ baseUrl: 'https://api.example.com', authToken: 'tok_xyz' });
      globalThis.fetch = mockFetchResponse({});
      c.healthCheck();
      const headers = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
      expect(headers).not.toHaveProperty('X-Clerk-User-Id');
      expect(headers['Authorization']).toBe('Bearer tok_xyz');
    });

    it('should update headers after setClerkUserId / setAuthToken', () => {
      client.setClerkUserId('user_new');
      client.setAuthToken('tok_new');
      globalThis.fetch = mockFetchResponse({});
      client.healthCheck();
      const headers = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
      expect(headers['X-Clerk-User-Id']).toBe('user_new');
      expect(headers['Authorization']).toBe('Bearer tok_new');
    });

    it('should remove headers when set to null', () => {
      client.setClerkUserId(null);
      client.setAuthToken(null);
      globalThis.fetch = mockFetchResponse({});
      client.healthCheck();
      const headers = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
      expect(headers).not.toHaveProperty('X-Clerk-User-Id');
      expect(headers).not.toHaveProperty('Authorization');
    });
  });

  // ── request() behavior ─────────────────────────────────────────────────

  describe('request() internals', () => {
    it('should return parsed JSON on success', async () => {
      const payload = { status: 'healthy', database: 'ok' };
      globalThis.fetch = mockFetchResponse(payload);
      const result = await client.healthCheck();
      expect(result).toEqual(payload);
    });

    it('should return undefined for 204 No Content', async () => {
      globalThis.fetch = mockFetch204();
      const result = await client.deleteCashAccount('acc_1');
      expect(result).toBeUndefined();
    });

    it('should throw StrataApiError on non-ok response with detail', async () => {
      globalThis.fetch = mockFetchError(422, 'Validation failed');
      await expect(client.healthCheck()).rejects.toThrow(StrataApiError);
      try {
        globalThis.fetch = mockFetchError(422, 'Validation failed');
        await client.healthCheck();
      } catch (e) {
        const err = e as StrataApiError;
        expect(err.status).toBe(422);
        expect(err.message).toBe('Validation failed');
        expect(err.detail).toBe('Validation failed');
      }
    });

    it('should throw StrataApiError with fallback message when no detail', async () => {
      globalThis.fetch = mockFetchError(500);
      try {
        await client.healthCheck();
      } catch (e) {
        const err = e as StrataApiError;
        expect(err.status).toBe(500);
        expect(err.message).toBe('Request failed: 500 Bad Request');
        expect(err.detail).toBeUndefined();
      }
    });

    it('should handle non-JSON error body gracefully', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        json: vi.fn().mockRejectedValue(new Error('not json')),
      });
      try {
        await client.healthCheck();
      } catch (e) {
        const err = e as StrataApiError;
        expect(err.status).toBe(502);
        expect(err.message).toBe('Request failed: 502 Bad Gateway');
      }
    });
  });

  // ── Representative API methods ─────────────────────────────────────────

  describe('healthCheck()', () => {
    it('should GET /api/v1/health', async () => {
      globalThis.fetch = mockFetchResponse({ status: 'ok', database: 'ok' });
      await client.healthCheck();
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/health',
        expect.objectContaining({
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        }),
      );
      // Default method should be GET (no method key or undefined)
      const opts = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      expect(opts.method).toBeUndefined();
    });
  });

  describe('getAccounts()', () => {
    it('should GET /api/v1/accounts', async () => {
      const payload = { cash: [], debt: [], investment: [] };
      globalThis.fetch = mockFetchResponse(payload);
      const result = await client.getAccounts();
      expect(result).toEqual(payload);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/accounts',
        expect.any(Object),
      );
    });
  });

  describe('createCashAccount()', () => {
    it('should POST /api/v1/accounts/cash with JSON body', async () => {
      const input = { name: 'Checking', balance: 5000, institution_name: 'Chase' };
      const response = { id: 'ca_1', ...input };
      globalThis.fetch = mockFetchResponse(response);
      const result = await client.createCashAccount(input as any);
      expect(result).toEqual(response);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/accounts/cash',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(input),
        }),
      );
    });
  });

  describe('deleteConnection()', () => {
    it('should DELETE /api/v1/connections/:id', async () => {
      globalThis.fetch = mockFetchResponse({ status: 'deleted' });
      const result = await client.deleteConnection('conn_99');
      expect(result).toEqual({ status: 'deleted' });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/connections/conn_99',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('searchInstitutions()', () => {
    it('should GET /api/v1/institutions with query params', async () => {
      globalThis.fetch = mockFetchResponse([]);
      await client.searchInstitutions('Chase', 5);
      const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(url).toContain('/api/v1/institutions');
      expect(url).toContain('q=Chase');
      expect(url).toContain('limit=5');
    });

    it('should omit query params when not provided', async () => {
      globalThis.fetch = mockFetchResponse([]);
      await client.searchInstitutions();
      const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(url).toBe('https://api.example.com/api/v1/institutions');
    });
  });

  describe('createLinkSession()', () => {
    it('should POST /api/v1/connections/link with body', async () => {
      const linkReq = { redirect_uri: 'https://app.example.com/callback' };
      globalThis.fetch = mockFetchResponse({ link_url: 'https://link.example.com' });
      await client.createLinkSession(linkReq as any);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/connections/link',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(linkReq),
        }),
      );
    });

    it('should send empty object when no request provided', async () => {
      globalThis.fetch = mockFetchResponse({ link_url: 'https://link.example.com' });
      await client.createLinkSession();
      const body = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body;
      expect(body).toBe('{}');
    });
  });
});

// ─── isValidVIN ─────────────────────────────────────────────────────────────

describe('isValidVIN', () => {
  it('should accept a valid 17-character VIN', () => {
    expect(isValidVIN('1HGCM82633A004352')).toBe(true);
  });

  it('should accept lowercase input (case insensitive)', () => {
    expect(isValidVIN('1hgcm82633a004352')).toBe(true);
  });

  it('should reject VINs shorter than 17 characters', () => {
    expect(isValidVIN('1HGCM82633A0043')).toBe(false);
  });

  it('should reject VINs longer than 17 characters', () => {
    expect(isValidVIN('1HGCM82633A00435299')).toBe(false);
  });

  it('should reject VINs containing I', () => {
    expect(isValidVIN('1HGCM82633I004352')).toBe(false);
  });

  it('should reject VINs containing O', () => {
    expect(isValidVIN('1HGCM82633O004352')).toBe(false);
  });

  it('should reject VINs containing Q', () => {
    expect(isValidVIN('1HGCM82633Q004352')).toBe(false);
  });

  it('should reject empty string', () => {
    expect(isValidVIN('')).toBe(false);
  });

  it('should reject VINs with special characters', () => {
    expect(isValidVIN('1HGCM8263-A004352')).toBe(false);
  });
});
