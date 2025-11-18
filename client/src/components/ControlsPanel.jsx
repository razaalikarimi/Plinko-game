import React from 'react';

export function ControlsPanel({
  clientSeed,
  onSeedChange,
  betAmount,
  onBetChange,
  dropColumn,
  onColumnChange,
  onDrop,
  dropping,
  canDrop,
  onNewRound,
  muted,
  onToggleMute,
  tiltMode,
  onToggleTilt,
  goldenReady
}) {
  return (
    <section className="panel controls-panel">
      <div className="panel-header">
        <h2>Controls</h2>
        <div className="pill-group">
          <button
            type="button"
            className={`pill ${tiltMode ? 'active' : ''}`}
            onClick={onToggleTilt}
            title="Toggle tilt mode (T)"
          >
            Tilt · T
          </button>
          <button
            type="button"
            className={`pill ${muted ? '' : 'active'}`}
            onClick={onToggleMute}
          >
            {muted ? 'Muted' : 'Sound'}
          </button>
          <span className={`pill ${goldenReady ? 'active' : ''}`}>
            Golden Ready
          </span>
        </div>
      </div>

      <label>
        Client seed
        <input
          type="text"
          value={clientSeed}
          onChange={(e) => onSeedChange(e.target.value)}
          maxLength={64}
        />
      </label>

      <label>
        Bet (USD)
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={betAmount}
          onChange={(e) => onBetChange(e.target.value)}
        />
      </label>

      <label>
        Drop column: {dropColumn}
        <input
          type="range"
          min="0"
          max="12"
          value={dropColumn}
          onChange={(e) => onColumnChange(Number(e.target.value))}
        />
      </label>

      <div className="control-actions">
        <button
          type="button"
          className="primary"
          onClick={onDrop}
          disabled={!canDrop || dropping}
        >
          {dropping ? 'Dropping…' : 'Drop · Space'}
        </button>
        <button type="button" onClick={onNewRound}>
          New Commit
        </button>
      </div>
    </section>
  );
}

