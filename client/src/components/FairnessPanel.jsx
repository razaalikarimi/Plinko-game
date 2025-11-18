import React from 'react';
import { Link } from 'react-router-dom';

export function FairnessPanel({
  roundId,
  status,
  commitHex,
  pegMapHash,
  payoutMultiplier,
  combinedSeed,
  clientSeed,
  serverSeed,
  nonce,
  dropColumn
}) {
  const canVerify = Boolean(serverSeed && clientSeed && nonce);
  const query = new URLSearchParams();
  if (roundId) query.set('roundId', roundId);
  if (serverSeed) query.set('serverSeed', serverSeed);
  if (clientSeed) query.set('clientSeed', clientSeed);
  if (nonce) query.set('nonce', nonce);
  if (typeof dropColumn === 'number') {
    query.set('dropColumn', String(dropColumn));
  }

  return (
    <section className="panel fairness-panel">
      <div className="panel-header">
        <h2>Fairness</h2>
        {roundId && (
          <Link
            to={canVerify ? `/verify?${query.toString()}` : '/verify'}
            className="round-link"
          >
            #{roundId.slice(-6)}
          </Link>
        )}
      </div>

      <dl>
        <div>
          <dt>Status</dt>
          <dd>{status}</dd>
        </div>
        <div>
          <dt>Commit (SHA-256)</dt>
          <dd className="mono">{commitHex || '—'}</dd>
        </div>
        <div>
          <dt>Peg map hash</dt>
          <dd className="mono">{pegMapHash || '—'}</dd>
        </div>
        <div>
          <dt>Payout multiplier</dt>
          <dd>{payoutMultiplier ? `${payoutMultiplier}x` : '—'}</dd>
        </div>
        <div>
          <dt>Combined seed</dt>
          <dd className="mono">
            {combinedSeed ? combinedSeed.slice(0, 32) + '…' : '—'}
          </dd>
        </div>
        <div>
          <dt>Server seed</dt>
          <dd className="mono">{serverSeed || 'Hidden'}</dd>
        </div>
        <div>
          <dt>Nonce</dt>
          <dd>{nonce || '—'}</dd>
        </div>
        <div>
          <dt>Drop column</dt>
          <dd>{dropColumn ?? '—'}</dd>
        </div>
      </dl>
    </section>
  );
}

