import { memo } from 'react';
import type { AbilityCalculation } from '../services/abilityCalculator';

interface AbilityDisplayProps {
  calculations: AbilityCalculation[];
  heroName: string;
}

export const AbilityDisplay = memo(function AbilityDisplay({ calculations, heroName }: AbilityDisplayProps) {
  if (calculations.length === 0) {
    return null;
  }

  const formatNumber = (value: number, decimals: number = 1): string => {
    return value.toFixed(decimals);
  };

  const getScalingIndicator = (base: number, scaled: number): string => {
    if (base === 0) return '';
    const diff = ((scaled - base) / base) * 100;
    if (diff === 0) return '';
    return diff > 0 ? ` (+${diff.toFixed(0)}%)` : ` (${diff.toFixed(0)}%)`;
  };

  return (
    <div className="ability-display">
      <h2>{heroName} Abilities</h2>

      <div className="abilities-container">
        {calculations.map((calc, index) => (
          <div key={calc.ability.id} className="ability-card">
            <div className="ability-header">
              {calc.ability.image && (
                <img
                  src={calc.ability.image}
                  alt={calc.ability.name}
                  className="ability-icon"
                />
              )}
              <div className="ability-title">
                <h3>{calc.ability.name}</h3>
                {calc.ability.description?.desc && (
                  <p className="ability-desc">{calc.ability.description.desc}</p>
                )}
              </div>
            </div>

            <div className="ability-stats">
              {calc.scaledDamage > 0 && (
                <div className="ability-stat">
                  <span className="stat-label">Damage</span>
                  <span className="stat-value damage">
                    {formatNumber(calc.scaledDamage)}
                    <span className="stat-scaling">
                      {getScalingIndicator(calc.baseDamage, calc.scaledDamage)}
                    </span>
                  </span>
                </div>
              )}

              {calc.baseCooldown > 0 && (
                <div className="ability-stat">
                  <span className="stat-label">Cooldown</span>
                  <span className="stat-value cooldown">
                    {formatNumber(calc.scaledCooldown, 1)}s
                    <span className="stat-scaling">
                      {getScalingIndicator(calc.baseCooldown, calc.scaledCooldown)}
                    </span>
                  </span>
                </div>
              )}

              {calc.baseDuration > 0 && (
                <div className="ability-stat">
                  <span className="stat-label">Duration</span>
                  <span className="stat-value">
                    {formatNumber(calc.scaledDuration, 1)}s
                  </span>
                </div>
              )}

              {calc.baseRange !== '0m' && (
                <div className="ability-stat">
                  <span className="stat-label">Range</span>
                  <span className="stat-value">{calc.scaledRange}</span>
                </div>
              )}

              {calc.charges > 1 && (
                <div className="ability-stat">
                  <span className="stat-label">Charges</span>
                  <span className="stat-value">{calc.charges}</span>
                </div>
              )}

              {calc.dps > 0 && (
                <div className="ability-stat highlighted">
                  <span className="stat-label">DPS</span>
                  <span className="stat-value">{formatNumber(calc.dps, 1)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
