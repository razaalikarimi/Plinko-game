import { describe, it, expect } from 'vitest';
import request from 'supertest';
import appModule from '../src/app.js';

const app = appModule.default || appModule;

describe('GET /api/verify', () => {
  it('returns deterministic recomputation payload', async () => {
    const res = await request(app)
      .get('/api/verify')
      .query({
        serverSeed: 'b2a5f3f32a4d9c6ee7a8c1d33456677890abcdeffedcba0987654321ffeeddcc',
        nonce: '42',
        clientSeed: 'candidate-hello',
        dropColumn: 6
      })
      .expect(200);

    expect(res.body).toMatchObject({
      commitHex: 'bb9acdc67f3f18f3345236a01f0e5072596657a9005c7d8a22cff061451a6b34',
      roundComparison: null
    });
    expect(res.body.path).toHaveLength(12);
    expect(res.body.binIndex).toBeGreaterThanOrEqual(0);
  });
});

