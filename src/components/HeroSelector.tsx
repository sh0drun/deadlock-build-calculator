import { memo } from 'react';
import type { Hero } from '../types';

interface HeroSelectorProps {
  heroes: Hero[];
  selectedHero: Hero | null;
  onSelectHero: (hero: Hero) => void;
  loading?: boolean;
}

export const HeroSelector = memo(function HeroSelector({ heroes, selectedHero, onSelectHero, loading }: HeroSelectorProps) {
  if (loading) {
    return <div className="hero-selector loading">Loading heroes...</div>;
  }

  return (
    <div className="hero-selector">
      <h2>Select Hero</h2>
      <div className="hero-grid">
        {heroes.map((hero) => (
          <div
            key={hero.id}
            className={`hero-card ${selectedHero?.id === hero.id ? 'selected' : ''}`}
            onClick={() => onSelectHero(hero)}
          >
            <img
              src={hero.images?.icon_image_small || hero.images?.icon_hero_card}
              alt={hero.name}
              className="hero-image"
            />
            <div className="hero-name">{hero.name}</div>
            {hero.complexity && (
              <div className="hero-complexity">
                Complexity: {'★'.repeat(hero.complexity)}
              </div>
            )}
          </div>
        ))}
      </div>
      {selectedHero && (
        <div className="selected-hero-info">
          <h3>{selectedHero.name}</h3>
          {selectedHero.description?.role && (
            <p className="hero-role">{selectedHero.description.role}</p>
          )}
        </div>
      )}
    </div>
  );
});
