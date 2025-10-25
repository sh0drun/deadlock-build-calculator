import type { HeroStats } from '../services/statsCalculator';

interface StatsDisplayProps {
  stats: HeroStats | null;
  heroName: string;
}

export function StatsDisplay({ stats, heroName }: StatsDisplayProps) {
  if (!stats) {
    return null;
  }

  const formatNumber = (value: number, decimals: number = 1): string => {
    return value.toFixed(decimals);
  };

  const formatPercent = (value: number, decimals: number = 1): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  };

  return (
    <div className="stats-display">
      <h2>{heroName} Stats</h2>

      <div className="stats-container">
        {/* Weapon Stats */}
        <div className="stat-section weapon-section">
          <div className="section-header">
            <span className="section-icon">⚔</span>
            <span className="section-title">Weapon</span>
          </div>
          <div className="stat-list">
            <div className="stat-row">
              <span className="stat-name">Damage</span>
              <span className="stat-val">{formatNumber(stats.bulletDamage)}</span>
            </div>
            <div className="stat-row">
              <span className="stat-name">Fire Rate</span>
              <span className="stat-val">{formatNumber(stats.roundsPerSecond, 2)}/s</span>
            </div>
            <div className="stat-row">
              <span className="stat-name">Clip</span>
              <span className="stat-val">{Math.round(stats.clipSize)}</span>
            </div>
            <div className="stat-row">
              <span className="stat-name">Reload</span>
              <span className="stat-val">{formatNumber(stats.reloadTime, 2)}s</span>
            </div>
            {stats.bulletLifesteal > 0 && (
              <div className="stat-row bonus">
                <span className="stat-name">Lifesteal</span>
                <span className="stat-val">{formatPercent(stats.bulletLifesteal)}</span>
              </div>
            )}
            <div className="stat-row">
              <span className="stat-name">Melee</span>
              <span className="stat-val">{Math.round(stats.lightMeleeDamage)}/{Math.round(stats.heavyMeleeDamage)}</span>
            </div>
          </div>
        </div>

        {/* Vitality Stats */}
        <div className="stat-section vitality-section">
          <div className="section-header">
            <span className="section-icon">❤</span>
            <span className="section-title">Vitality</span>
          </div>
          <div className="stat-list">
            <div className="stat-row">
              <span className="stat-name">Health</span>
              <span className="stat-val">{Math.round(stats.maxHealth)}</span>
            </div>
            <div className="stat-row">
              <span className="stat-name">Regen</span>
              <span className="stat-val">{formatNumber(stats.baseHealthRegen)}/s</span>
            </div>
            {stats.ooHealthRegen > 0 && (
              <div className="stat-row bonus">
                <span className="stat-name">OOC Regen</span>
                <span className="stat-val">{formatNumber(stats.ooHealthRegen)}/s</span>
              </div>
            )}
            {stats.bulletArmor > 0 && (
              <div className="stat-row bonus">
                <span className="stat-name">Bullet Resist</span>
                <span className="stat-val">{formatPercent(stats.bulletArmor)}</span>
              </div>
            )}
            {stats.techArmor > 0 && (
              <div className="stat-row bonus">
                <span className="stat-name">Spirit Resist</span>
                <span className="stat-val">{formatPercent(stats.techArmor)}</span>
              </div>
            )}
            {stats.meleeResist > 0 && (
              <div className="stat-row bonus">
                <span className="stat-name">Melee Resist</span>
                <span className="stat-val">{formatPercent(stats.meleeResist)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Spirit & Mobility Combined */}
        <div className="stat-section-row">
          {(stats.techPower > 0 || stats.techCooldown > 0) && (
            <div className="stat-section spirit-section compact">
              <div className="section-header">
                <span className="section-icon">✦</span>
                <span className="section-title">Spirit</span>
              </div>
              <div className="stat-list">
                {stats.techPower > 0 && (
                  <div className="stat-row bonus">
                    <span className="stat-name">Power</span>
                    <span className="stat-val">{Math.round(stats.techPower)}</span>
                  </div>
                )}
                {stats.techCooldown > 0 && (
                  <div className="stat-row bonus">
                    <span className="stat-name">CDR</span>
                    <span className="stat-val">{formatPercent(stats.techCooldown)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="stat-section mobility-section compact">
            <div className="section-header">
              <span className="section-icon">⚡</span>
              <span className="section-title">Mobility</span>
            </div>
            <div className="stat-list">
              <div className="stat-row">
                <span className="stat-name">Move</span>
                <span className="stat-val">{formatNumber(stats.maxMoveSpeed)}m/s</span>
              </div>
              <div className="stat-row">
                <span className="stat-name">Sprint</span>
                <span className="stat-val">{formatNumber(stats.sprintSpeed)}m/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
