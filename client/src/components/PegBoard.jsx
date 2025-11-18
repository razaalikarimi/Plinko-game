import React from 'react';
import classNames from 'classnames';
import { PAYTABLE } from '../lib/paytable';

const ROWS = 12;

function getPegX(row, pegIndex) {
  const offset = (ROWS - row) / 2;
  const column = offset + pegIndex;
  return column;
}

function getBallPosition(step) {
  if (!step) return { x: ROWS / 2, y: -1 };
  return {
    x: getPegX(step.row + 1, step.position),
    y: step.row + 0.5
  };
}

export function PegBoard({
  path,
  activeIndex,
  binIndex,
  tiltMode,
  golden,
  dropColumn
}) {
  const activeStep = path?.[activeIndex];
  const ballPos = getBallPosition(activeStep);

  return (
    <div
      className={classNames('peg-board', {
        'peg-board--tilt': tiltMode
      })}
    >
      <svg
        viewBox={`0 -1 ${ROWS} ${ROWS + 2}`}
        role="img"
        aria-label="Plinko peg board"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.4" result="colored" />
            <feMerge>
              <feMergeNode in="colored" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* drop column indicator */}
        <line
          x1={dropColumn}
          y1={-1}
          x2={dropColumn}
          y2={ROWS + 0.2}
          className="drop-column-line"
        />

        {/* pegs */}
        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: row + 1 }, (_, pegIndex) => {
            const x = getPegX(row, pegIndex) + 0.5;
            const y = row;
            const isActive =
              activeStep &&
              activeStep.row === row &&
              activeStep.pegIndex === pegIndex;
            return (
              <circle
                key={`${row}-${pegIndex}`}
                cx={x}
                cy={y}
                r={0.22}
                className={classNames('peg', { 'peg--active': isActive })}
              />
            );
          })
        )}

        {/* ball */}
        <circle
          cx={ballPos.x + 0.5}
          cy={ballPos.y}
          r={0.3}
          className={classNames('ball', {
            'ball--visible': Boolean(activeStep),
            'ball--golden': golden
          })}
          filter={golden ? 'url(#glow)' : undefined}
        />
      </svg>

      <div className="bins">
        {PAYTABLE.map((multiplier, idx) => (
          <div
            key={idx}
            className={classNames('bin', {
              'bin--active': idx === binIndex
            })}
          >
            <span className="bin-index">{idx}</span>
            <span className="bin-multiplier">{multiplier}x</span>
          </div>
        ))}
      </div>
    </div>
  );
}

