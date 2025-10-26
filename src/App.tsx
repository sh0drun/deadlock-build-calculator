import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Hero, Item, WeaponItem } from './types';
import { DeadlockAPI } from './services/deadlockApi';
import { DPSCalculator } from './services/dpsCalculator';
import { StatsCalculator } from './services/statsCalculator';
import { BuildStorage } from './services/buildStorage';
import { HeroSelector } from './components/HeroSelector';
import { ItemSelector } from './components/ItemSelector';
import { DPSDisplay } from './components/DPSDisplay';
import { StatsDisplay } from './components/StatsDisplay';
import { BuildManager } from './components/BuildManager';
import { ErrorState } from './components/ErrorState';
import { BuildComparison } from './components/BuildComparison';
import { LoadingScreen } from './components/LoadingSkeleton';
import { useToast } from './components/ToastContainer';
import './App.css';

interface BuildToCompare {
  hero: Hero;
  items: Item[];
  name: string;
}

function App() {
  const toast = useToast();
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weaponData, setWeaponData] = useState<WeaponItem[]>([]);
  const [buildsToCompare, setBuildsToCompare] = useState<BuildToCompare[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Fetch heroes and items on mount
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [heroesData, itemsData, weaponItems] = await Promise.all([
        DeadlockAPI.getHeroes(),
        DeadlockAPI.getUpgradeItems(),
        fetch('https://assets.deadlock-api.com/v2/items/by-type/weapon').then(r => r.json())
      ]);

      // Filter to only playable heroes (not in development or disabled)
      const playableHeroes = heroesData.filter((hero: any) =>
        hero.player_selectable && !hero.disabled && !hero.in_development
      );

      setHeroes(playableHeroes);
      setItems(itemsData);
      setWeaponData(weaponItems);

      // Check for build in URL
      const urlParams = new URLSearchParams(window.location.search);
      const buildParam = urlParams.get('build');
      if (buildParam) {
        const decoded = BuildStorage.decodeBuildFromURL(buildParam);
        if (decoded) {
          const hero = playableHeroes.find((h: Hero) => h.id === decoded.heroId);
          const loadedItems = decoded.itemIds
            .map(id => itemsData.find((item: Item) => item.id === id))
            .filter((item): item is Item => item !== undefined);

          if (hero) {
            handleSelectHero(hero);
            setSelectedItems(loadedItems);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load game data. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Merge weapon_info into hero when selected - memoized to prevent unnecessary recalculations
  const handleSelectHero = useCallback((hero: Hero) => {
    const heroWeapon = weaponData.find(w => w.hero === hero.id || w.heroes?.includes(hero.id));
    const heroWithWeapon = {
      ...hero,
      weapon_info: heroWeapon?.weapon_info || {},
    };
    setSelectedHero(heroWithWeapon);
  }, [weaponData]);

  const handleAddItem = useCallback((item: Item) => {
    setSelectedItems(prev => {
      if (prev.length < 12 && !prev.find(i => i.id === item.id)) {
        return [...prev, item];
      }
      return prev;
    });
  }, []);

  const handleRemoveItem = useCallback((item: Item) => {
    setSelectedItems(prev => prev.filter(i => i.id !== item.id));
  }, []);

  const handleReorderItems = useCallback((newItems: Item[]) => {
    setSelectedItems(newItems);
  }, []);

  const handleLoadBuild = useCallback((heroId: number, itemIds: number[]) => {
    const hero = heroes.find(h => h.id === heroId);
    const loadedItems = itemIds
      .map(id => items.find(item => item.id === id))
      .filter((item): item is Item => item !== undefined);

    if (hero) {
      handleSelectHero(hero);
      setSelectedItems(loadedItems);
    }
  }, [heroes, items, handleSelectHero]);

  // Calculate DPS and Stats - memoized to prevent unnecessary recalculations
  const dpsResults = useMemo(() =>
    DPSCalculator.calculate(selectedHero, selectedItems),
    [selectedHero, selectedItems]
  );

  const heroStats = useMemo(() =>
    StatsCalculator.calculate(selectedHero, selectedItems),
    [selectedHero, selectedItems]
  );

  const handleAddToComparison = useCallback(() => {
    if (!selectedHero) return;

    const buildName = `${selectedHero.name} Build ${buildsToCompare.length + 1}`;
    setBuildsToCompare(prev => [...prev, {
      hero: selectedHero,
      items: [...selectedItems],
      name: buildName
    }]);
    toast.success(`Added "${buildName}" to comparison!`);
  }, [selectedHero, selectedItems, buildsToCompare.length, toast]);

  const handleRemoveFromComparison = useCallback((index: number) => {
    setBuildsToCompare(prev => prev.filter((_, idx) => idx !== index));
  }, []);

  const handleShowComparison = useCallback(() => {
    setShowComparison(true);
  }, []);

  const handleCloseComparison = useCallback(() => {
    setShowComparison(false);
  }, []);

  const handleClearComparison = useCallback(() => {
    setBuildsToCompare([]);
    setShowComparison(false);
    toast.info('Comparison cleared');
  }, [toast]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>Deadlock Build Calculator & DPS Optimizer</h1>
            <p>Select a hero and items to calculate DPS and optimize your build</p>
          </div>
          {buildsToCompare.length > 0 && (
            <div className="comparison-controls">
              <button
                onClick={handleShowComparison}
                className="comparison-btn"
                disabled={buildsToCompare.length < 2}
              >
                Compare Builds ({buildsToCompare.length})
              </button>
              <button onClick={handleClearComparison} className="clear-comparison-btn">
                Clear
              </button>
            </div>
          )}
        </div>
      </header>

      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <div className="app-content">
          <div className="left-panel">
            <BuildManager
              selectedHero={selectedHero}
              selectedItems={selectedItems}
              onLoadBuild={handleLoadBuild}
            />

            <HeroSelector
              heroes={heroes}
              selectedHero={selectedHero}
              onSelectHero={handleSelectHero}
            />

            {selectedHero && (
              <>
                <div className="comparison-add-section">
                  <button
                    onClick={handleAddToComparison}
                    className="add-to-comparison-btn"
                    disabled={buildsToCompare.length >= 4}
                  >
                    + Add to Comparison
                  </button>
                  {buildsToCompare.length >= 4 && (
                    <p className="comparison-limit-text">Maximum 4 builds</p>
                  )}
                </div>

                <DPSDisplay
                  dps={dpsResults}
                  heroName={selectedHero.name}
                />
                <StatsDisplay
                  stats={heroStats}
                  heroName={selectedHero.name}
                />
              </>
            )}
          </div>

          <div className="right-panel">
            {selectedHero ? (
              <ItemSelector
                items={items}
                selectedItems={selectedItems}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onReorderItems={handleReorderItems}
              />
            ) : (
              <div className="no-hero-selected">
                <p>Select a hero to start building</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showComparison && buildsToCompare.length >= 2 && (
        <BuildComparison
          builds={buildsToCompare}
          onClose={handleCloseComparison}
          onRemoveBuild={handleRemoveFromComparison}
        />
      )}
    </div>
  );
}

export default App;
