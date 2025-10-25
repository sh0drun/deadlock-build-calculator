import { useMemo } from 'react';
import type { Hero, Item, DPSCalculation } from '../types';
import { DPSCalculator } from '../services/dpsCalculator';
import { StatsCalculator } from '../services/statsCalculator';

interface BuildData {
  hero: Hero;
  items: Item[];
  name: string;
}

interface BuildComparisonProps {
  builds: BuildData[];
  onClose: () => void;
  onRemoveBuild: (index: number) => void;
}

export function BuildComparison({ builds, onClose, onRemoveBuild }: BuildComparisonProps) {
  const buildStats = useMemo(() => {
    return builds.map(build => ({
      dps: DPSCalculator.calculate(build.hero, build.items),
      stats: StatsCalculator.calculate(build.hero, build.items),
      totalCost: build.items.reduce((sum, item) => sum + item.cost, 0),
    }));
  }, [builds]);

  const getBestValue = (values: number[], higher: boolean = true) => {
    if (values.length === 0) return null;
    return higher ? Math.max(...values) : Math.min(...values);
  };

  const formatStatDiff = (value: number, best: number | null, higher: boolean = true) => {
    if (best === null) return '';
    if (value === best) return 'best';
    const diff = ((value - best) / best) * 100;
    return diff > 0 ? 'better' : 'worse';
  };

  const renderStatRow = (
    label: string,
    values: number[],
    format: (val: number) => string = (v) => v.toFixed(0),
    higherIsBetter: boolean = true
  ) => {
    const best = getBestValue(values, higherIsBetter);
    return (
      <div className="comparison-stat-row">
        <div className="stat-label">{label}</div>
        {values.map((value, idx) => (
          <div
            key={idx}
            className={`stat-value ${formatStatDiff(value, best, higherIsBetter)}`}
          >
            {format(value)}
          </div>
        ))}
      </div>
    );
  };

  if (builds.length === 0) {
    return null;
  }

  return (
    <div className="comparison-overlay" onClick={onClose}>
      <div className="comparison-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comparison-header">
          <h2>Build Comparison</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="comparison-content">
          {/* Build Headers */}
          <div className="comparison-grid">
            <div className="comparison-label-column">
              <div className="comparison-build-header">Build</div>
            </div>
            {builds.map((build, idx) => (
              <div key={idx} className="comparison-build-column">
                <div className="comparison-build-header">
                  <img
                    src={build.hero.images?.icon_image_small}
                    alt={build.hero.name}
                    className="build-hero-icon"
                  />
                  <div className="build-header-info">
                    <div className="build-name">{build.name}</div>
                    <div className="build-hero-name">{build.hero.name}</div>
                  </div>
                  <button
                    onClick={() => onRemoveBuild(idx)}
                    className="remove-build-btn"
                    title="Remove from comparison"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DPS Stats */}
          <div className="comparison-section">
            <h3>DPS Statistics</h3>
            {renderStatRow('Base DPS', buildStats.map(s => s.dps.baseDPS))}
            {renderStatRow('Modified DPS', buildStats.map(s => s.dps.modifiedDPS))}
            {renderStatRow('Headshot DPS', buildStats.map(s => s.dps.headshotDPS))}
            {renderStatRow('Burst Damage', buildStats.map(s => s.dps.burstDamage))}
            {renderStatRow('Sustained DPS', buildStats.map(s => s.dps.sustainedDPS))}
            {renderStatRow(
              'DPS Increase',
              buildStats.map(s => s.dps.damageIncrease),
              (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`
            )}
          </div>

          {/* Weapon Stats */}
          <div className="comparison-section">
            <h3>Weapon Stats</h3>
            {renderStatRow(
              'Bullet Damage',
              buildStats.map(s => s.stats?.bulletDamage || 0),
              (v) => v.toFixed(1)
            )}
            {renderStatRow(
              'Fire Rate',
              buildStats.map(s => s.stats?.roundsPerSecond || 0),
              (v) => `${v.toFixed(2)}/s`
            )}
            {renderStatRow(
              'Clip Size',
              buildStats.map(s => s.stats?.clipSize || 0),
              (v) => v.toFixed(0)
            )}
            {renderStatRow(
              'Bullet Lifesteal',
              buildStats.map(s => s.stats?.bulletLifesteal || 0),
              (v) => `${v.toFixed(1)}%`
            )}
          </div>

          {/* Vitality Stats */}
          <div className="comparison-section">
            <h3>Vitality Stats</h3>
            {renderStatRow(
              'Max Health',
              buildStats.map(s => s.stats?.maxHealth || 0),
              (v) => v.toFixed(0)
            )}
            {renderStatRow(
              'Health Regen',
              buildStats.map(s => s.stats?.baseHealthRegen || 0),
              (v) => `${v.toFixed(1)}/s`
            )}
            {renderStatRow(
              'Bullet Armor',
              buildStats.map(s => s.stats?.bulletArmor || 0),
              (v) => `${v.toFixed(1)}%`
            )}
            {renderStatRow(
              'Spirit Resist',
              buildStats.map(s => s.stats?.techArmor || 0),
              (v) => `${v.toFixed(1)}%`
            )}
          </div>

          {/* Spirit Stats */}
          <div className="comparison-section">
            <h3>Spirit Stats</h3>
            {renderStatRow(
              'Spirit Power',
              buildStats.map(s => s.stats?.techPower || 0),
              (v) => v.toFixed(0)
            )}
            {renderStatRow(
              'Cooldown Reduction',
              buildStats.map(s => s.stats?.techCooldown || 0),
              (v) => `${v.toFixed(1)}%`
            )}
          </div>

          {/* Cost */}
          <div className="comparison-section">
            <h3>Build Cost</h3>
            {renderStatRow(
              'Total Cost',
              buildStats.map(s => s.totalCost),
              (v) => `${v.toLocaleString()} souls`,
              false // Lower cost is better
            )}
            {renderStatRow(
              'DPS per 1000 Souls',
              buildStats.map((s, idx) =>
                s.totalCost > 0 ? (s.dps.modifiedDPS / s.totalCost) * 1000 : 0
              ),
              (v) => v.toFixed(1)
            )}
          </div>

          {/* Item Comparison */}
          <div className="comparison-section">
            <h3>Items ({builds[0].items.length} slots)</h3>
            <div className="items-comparison-grid">
              {builds.map((build, idx) => (
                <div key={idx} className="build-items-column">
                  <div className="build-items-list">
                    {build.items.map((item) => (
                      <div key={item.id} className="comparison-item">
                        <img src={item.shop_image_small} alt={item.name} title={item.name} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
