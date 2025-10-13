import type { DPSCalculation } from '../types';

interface DPSDisplayProps {
  dps: DPSCalculation;
  heroName?: string;
}

export function DPSDisplay({ dps, heroName }: DPSDisplayProps) {
  return (
    <div className="dps-display">
      <h2>DPS Calculator {heroName && `- ${heroName}`}</h2>

      <div className="dps-stats-grid">
        {/* Base Stats */}
        <div className="stat-card primary">
          <div className="stat-label">Base DPS</div>
          <div className="stat-value">{dps.baseDPS}</div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-label">Modified DPS</div>
          <div className="stat-value">{dps.modifiedDPS}</div>
          {dps.damageIncrease !== 0 && (
            <div className={`stat-change ${dps.damageIncrease > 0 ? 'positive' : 'negative'}`}>
              {dps.damageIncrease > 0 ? '+' : ''}{dps.damageIncrease}%
            </div>
          )}
        </div>

        <div className="stat-card critical">
          <div className="stat-label">Headshot DPS</div>
          <div className="stat-value">{dps.headshotDPS}</div>
        </div>

        {/* Secondary Stats */}
        <div className="stat-card">
          <div className="stat-label">Effective Fire Rate</div>
          <div className="stat-value">{dps.effectiveFireRate} /sec</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Effective Clip Size</div>
          <div className="stat-value">{dps.effectiveClipSize}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Burst Damage</div>
          <div className="stat-value">{dps.burstDamage}</div>
          <div className="stat-sub">Full clip damage</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Sustained DPS</div>
          <div className="stat-value">{dps.sustainedDPS}</div>
          <div className="stat-sub">With reload</div>
        </div>
      </div>

      {/* DPS Breakdown */}
      <div className="dps-breakdown">
        <h3>DPS Breakdown</h3>
        <div className="breakdown-info">
          <div className="info-row">
            <span>DPS Increase:</span>
            <span className={dps.damageIncrease > 0 ? 'positive' : ''}>
              {dps.damageIncrease > 0 ? '+' : ''}{dps.damageIncrease}%
            </span>
          </div>
          <div className="info-row">
            <span>Headshot Multiplier:</span>
            <span>{(dps.headshotDPS / dps.modifiedDPS).toFixed(2)}x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
