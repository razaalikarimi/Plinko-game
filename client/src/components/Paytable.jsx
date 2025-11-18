import React from 'react';
import { PAYTABLE } from '../lib/paytable';

export function Paytable() {
  return (
    <section className="panel paytable">
      <div className="panel-header">
        <h2>Paytable</h2>
        <span className="panel-subtitle">Symmetric 0 - 12 bins</span>
      </div>
      <div className="paytable-grid">
        {PAYTABLE.map((multiplier, idx) => (
          <div key={idx} className="paytable-cell">
            <span>{idx}</span>
            <strong>{multiplier.toFixed(1)}x</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

